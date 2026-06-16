import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';

dotenv.config();


const app = express();
const port = process.env.PORT || 3000;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'apronhanger-dev-secret-change-in-prod';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors({
  origin: function(_origin, callback) { return callback(null, true); },
  credentials: true
}));
app.use((_req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
});
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ─── Auth Middleware ────────────────────────────────────────────────────────

interface AuthRequest extends Request {
  user?: { id: string; email: string; name: string; role: string; hospitalId?: string | null; candidateId?: string | null; };
}

async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    next();
  };
}

// ─── Health ─────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get("/test", (_req, res) => {
  res.json({
    message: "Backend is working",
  });
});

// ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, name, role, hospitalName } = req.body;
  if (!email || !password || !name || !role) {
    res.status(400).json({ error: 'email, password, name and role are required' });
    return;
  }
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let hospitalId: string | null = null;
    let candidateId: string | null = null;

    if (role === 'RECRUITER') {
      // Find or create a hospital
      const trimmedName = (hospitalName || name + "'s Hospital").trim();
      let hospital = await prisma.hospital.findFirst({ where: { name: trimmedName } });
      if (!hospital) {
        hospital = await prisma.hospital.create({
          data: {
            name: trimmedName,
            shortName: trimmedName.split(' ').slice(0, 2).join(' '),
            type: 'Hospital',
            city: '',
            state: '',
            verified: false,
            specialties: JSON.stringify([]),
            about: '',
          }
        });
      }
      hospitalId = hospital.id;
    }

    const user = await prisma.user.create({
      data: { email, passwordHash, name, role, hospitalId }
    });

    if (role === 'CANDIDATE') {
      // Create the candidate profile stub
      const candidate = await prisma.candidate.create({
        data: {
          name,
          email,
          userId: user.id,
          initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        }
      });
      candidateId = candidate.id;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, hospitalId, candidateId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, hospitalId, candidateId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required' });
    return;
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Get candidateId if applicable
    let candidateId: string | null = null;
    if (user.role === 'CANDIDATE') {
      const candidate = await prisma.candidate.findUnique({ where: { userId: user.id } });
      candidateId = candidate?.id ?? null;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, hospitalId: user.hospitalId, candidateId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, hospitalId: user.hospitalId, candidateId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Me
app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// ─── JOBS ─────────────────────────────────────────────────────────────────────

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function computeJobMatch(job: any, profile: any): number {
  if (!profile) return 0;
  let score = 40;
  const role = String(profile.role || '').toLowerCase();
  const jobRole = String(job.role || '').toLowerCase();
  const jobSpec = String(job.specialty || '').toLowerCase();
  if (role && (jobRole.includes(role) || jobSpec.includes(role))) score += 20;
  const years = Number(profile.yearsExperience || profile.experienceYears || 0);
  const min = Number(job.experienceMin ?? 0);
  const max = Number(job.experienceMax ?? 20);
  if (years >= min && years <= max + 2) score += 20;
  else if (years >= min - 1) score += 10;
  const city = String(profile.city || profile.location || '').toLowerCase();
  const loc = String(job.city || job.location || '').toLowerCase();
  if (city && loc && (city.includes(loc.split(',')[0]) || loc.includes(city.split(',')[0]))) score += 15;
  const skills = [
    ...(profile.clinicalSkills || []),
    ...(safeJsonParse(profile.skills, []) as string[]),
  ].map((s: string) => s.toLowerCase());
  const tags = safeJsonParse(job.tags, [] as string[]).map((t: string) => t.toLowerCase());
  if (tags.some((t: string) => skills.some((s: string) => s.includes(t) || t.includes(s)))) score += 5;
  return Math.min(98, Math.max(52, score));
}

const CUSTOM_FIELD_TYPES = new Set(['text', 'textarea', 'number', 'select', 'checkbox']);

function normalizeJobCustomFields(raw: unknown): { ok: true; fields: any[] } | { ok: false; error: string } {
  if (raw == null) return { ok: true, fields: [] };
  if (!Array.isArray(raw)) return { ok: false, error: 'customApplicationFields must be an array' };
  if (raw.length > 30) return { ok: false, error: 'Maximum 30 custom fields per job' };
  const fields: any[] = [];
  const ids = new Set<string>();
  for (let i = 0; i < raw.length; i++) {
    const f = raw[i] as any;
    const label = String(f?.label || '').trim();
    const type = String(f?.type || 'text');
    if (!label) return { ok: false, error: `Custom field ${i + 1}: label is required` };
    if (label.length > 120) return { ok: false, error: `Custom field ${i + 1}: label is too long` };
    if (!CUSTOM_FIELD_TYPES.has(type)) {
      return { ok: false, error: `Custom field ${i + 1}: invalid type` };
    }
    const id = String(f?.id || `field-${i + 1}`).trim();
    if (!id || ids.has(id)) return { ok: false, error: `Custom field ${i + 1}: duplicate or missing id` };
    ids.add(id);
    const options =
      type === 'select'
        ? (Array.isArray(f?.options) ? f.options : [])
            .map((o: unknown) => String(o).trim())
            .filter(Boolean)
            .slice(0, 20)
        : undefined;
    if (type === 'select' && (!options || options.length < 2)) {
      return { ok: false, error: `Custom field "${label}": select needs at least 2 options` };
    }
    fields.push({
      id,
      label,
      type,
      required: Boolean(f?.required),
      placeholder: f?.placeholder ? String(f.placeholder).slice(0, 200) : undefined,
      helpText: f?.helpText ? String(f.helpText).slice(0, 300) : undefined,
      options,
    });
  }
  return { ok: true, fields };
}

function parseJobCustomFields(raw: string | null | undefined): any[] {
  return safeJsonParse(raw, [] as any[]);
}

function validateCustomFieldResponses(
  fields: any[],
  responses: unknown,
): { ok: true; normalized: Record<string, string | number | boolean> } | { ok: false; error: string } {
  const normalized: Record<string, string | number | boolean> = {};
  const map =
    responses && typeof responses === 'object' && !Array.isArray(responses)
      ? (responses as Record<string, unknown>)
      : {};
  for (const field of fields) {
    const raw = map[field.id];
    const empty =
      raw === undefined ||
      raw === null ||
      (typeof raw === 'string' && raw.trim() === '');
    if (field.type === 'checkbox') {
      const val = raw === true || raw === 'true' || raw === '1' || raw === 1;
      if (field.required && !val) {
        return { ok: false, error: `"${field.label}" is required` };
      }
      normalized[field.id] = val;
      continue;
    }
    if (empty) {
      if (field.required) return { ok: false, error: `"${field.label}" is required` };
      continue;
    }
    if (field.type === 'number') {
      const n = Number(raw);
      if (Number.isNaN(n)) return { ok: false, error: `"${field.label}" must be a number` };
      normalized[field.id] = n;
      continue;
    }
    const str = String(raw).trim();
    if (field.type === 'select' && field.options && !field.options.includes(str)) {
      return { ok: false, error: `"${field.label}": invalid option` };
    }
    if (str.length > 5000) return { ok: false, error: `"${field.label}" is too long` };
    normalized[field.id] = str;
  }
  return { ok: true, normalized };
}

const formatJob = (job: any, profile?: any) => ({
  ...job,
  hospital: job.hospital?.name ?? job.hospital ?? 'Unknown Hospital',
  hospitalVerified: job.hospital?.verified ?? false,
  hospitalAbout: job.hospital?.about ?? '',
  tags: safeJsonParse(job.tags, []),
  responsibilities: safeJsonParse(job.responsibilities, []),
  requirements: safeJsonParse(job.requirements, []),
  perks: safeJsonParse(job.perks, []),
  customApplicationFields: parseJobCustomFields(job.customApplicationFields),
  applicants: job.applications?.length ?? 0,
  shortlisted: job.applications?.filter((a: any) => a.status === 'Shortlisted').length ?? 0,
  matchPercent: profile ? computeJobMatch(job, profile) : undefined,
});

async function getCandidateProfileForMatch(req: Request): Promise<any | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as any;
    if (payload.role !== 'CANDIDATE' || !payload.candidateId) return null;
    const c = await prisma.candidate.findUnique({ where: { id: payload.candidateId } });
    if (!c) return null;
    if (c.profileJson) return safeJsonParse(c.profileJson, null);
    return {
      role: c.role,
      yearsExperience: c.experienceYears,
      city: c.location,
      clinicalSkills: safeJsonParse(c.skills, []),
    };
  } catch {
    return null;
  }
}

// Get all jobs — public (candidates: Active only) or filtered by hospital (recruiters: all)
app.get('/api/jobs', async (req: Request, res: Response) => {
  const { hospitalId } = req.query;
  try {
    const profile = await getCandidateProfileForMatch(req);
    const where = hospitalId
      ? { hospitalId: String(hospitalId) }
      : { status: 'Active' };
    const jobs = await prisma.job.findMany({
      where,
      include: { hospital: true, applications: true },
      orderBy: { postedDays: 'asc' }
    });
    res.json(jobs.map((j) => formatJob(j, profile)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single job — public
app.get('/api/jobs/:id', async (req: Request, res: Response) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: String(req.params.id) },
      include: { hospital: true, applications: true }
    });
    if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
    res.json(formatJob(job));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create job — recruiter only
app.post('/api/jobs', requireAuth, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body;
    const hospitalId = req.user!.hospitalId;
    if (!hospitalId) {
      res.status(400).json({ error: 'No hospital linked to your account' });
      return;
    }
    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    if (!hospital || !isHospitalProfileComplete(hospital)) {
      res.status(403).json({
        error: 'Complete your hospital profile in Settings before posting a job.',
        code: 'HOSPITAL_PROFILE_INCOMPLETE',
      });
      return;
    }
    // Explicitly map only valid Job schema fields — never spread unknown body keys into Prisma
    const job = await prisma.job.create({
      data: {
        hospitalId,
        role:            String(b.role       || ''),
        specialty:       String(b.specialty  || ''),
        category:        b.category   ? String(b.category)   : null,
        subSpecialty:    b.subSpecialty ? String(b.subSpecialty) : null,
        location:        String(b.location   || ''),
        city:            b.city       ? String(b.city)       : null,
        type:            String(b.type       || 'Full-time'),
        shift:           b.shift      ? String(b.shift)      : null,
        status:          String(b.status     || 'Active'),
        description:     String(b.description || ''),
        salaryMin:       Number(b.salaryMin  || 0),
        salaryMax:       Number(b.salaryMax  || 0),
        experienceMin:   b.experienceMin != null ? Number(b.experienceMin) : null,
        experienceMax:   b.experienceMax != null ? Number(b.experienceMax) : null,
        experience:      b.experience  ? String(b.experience) : null,
        postedDays:      0,
        tags:            b.tags            ? JSON.stringify(b.tags)            : null,
        responsibilities: b.responsibilities ? JSON.stringify(b.responsibilities) : null,
        requirements:    b.requirements
          ? JSON.stringify(Array.isArray(b.requirements) ? b.requirements : [String(b.requirements)])
          : null,
        perks:           b.perks           ? JSON.stringify(b.perks)           : null,
        customApplicationFields: (() => {
          const parsed = normalizeJobCustomFields(b.customApplicationFields);
          if (!parsed.ok) throw new Error(parsed.error);
          return parsed.fields.length > 0 ? JSON.stringify(parsed.fields) : null;
        })(),
      },
      include: { hospital: true, applications: true },
    });
    res.status(201).json(formatJob(job));
  } catch (error: any) {
    if (error?.message && typeof error.message === 'string' && !error.code) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update job (e.g. close) — recruiter only
app.patch('/api/jobs/:id', requireAuth, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ error: 'status is required' });
    return;
  }
  try {
    const job = await prisma.job.findUnique({
      where: { id: String(req.params.id) },
      include: { applications: true },
    });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    if (req.user!.hospitalId && job.hospitalId !== req.user!.hospitalId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const nextStatus = String(status);
    if (nextStatus === 'Closed') {
      if (job.status === 'Closed') {
        res.json(formatJob(job));
        return;
      }
      const [, updatedJob] = await prisma.$transaction([
        prisma.application.updateMany({
          where: {
            jobId: job.id,
            status: { in: ['New', 'Reviewed'] },
          },
          data: { status: 'JobClosed' },
        }),
        prisma.job.update({
          where: { id: job.id },
          data: { status: 'Closed' },
          include: { hospital: true, applications: true },
        }),
      ]);
      res.json(formatJob(updatedJob));
      return;
    }
    const updated = await prisma.job.update({
      where: { id: job.id },
      data: { status: nextStatus },
      include: { hospital: true, applications: true },
    });
    res.json(formatJob(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── HOSPITALS ───────────────────────────────────────────────────────────────

function isHospitalProfileComplete(h: {
  name?: string | null;
  type?: string | null;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  return !!(
    h.name?.trim() &&
    h.type?.trim() &&
    h.city?.trim() &&
    h.state?.trim() &&
    h.address?.trim() &&
    h.phone?.trim() &&
    h.email?.trim()
  );
}

function formatHospital(h: any) {
  return {
    ...h,
    specialties: safeJsonParse(h.specialties, [] as string[]),
    profileComplete: isHospitalProfileComplete(h),
  };
}

app.get('/api/hospitals/me', requireAuth, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
  try {
    const hospitalId = req.user!.hospitalId;
    if (!hospitalId) {
      res.status(404).json({ error: 'No hospital linked to your account' });
      return;
    }
    const hospital = await prisma.hospital.findUnique({ where: { id: hospitalId } });
    if (!hospital) {
      res.status(404).json({ error: 'Hospital not found' });
      return;
    }
    res.json(formatHospital(hospital));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/hospitals/me', requireAuth, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
  try {
    const hospitalId = req.user!.hospitalId;
    if (!hospitalId) {
      res.status(400).json({ error: 'No hospital linked to your account' });
      return;
    }
    const b = req.body;
    const data: Record<string, unknown> = {};
    if (b.name != null) data.name = String(b.name);
    if (b.shortName != null) data.shortName = String(b.shortName);
    if (b.type != null) data.type = String(b.type);
    if (b.city != null) data.city = String(b.city);
    if (b.state != null) data.state = String(b.state);
    if (b.address != null) data.address = String(b.address);
    if (b.phone != null) data.phone = String(b.phone);
    if (b.email != null) data.email = String(b.email);
    if (b.website != null) data.website = String(b.website);
    if (b.registrationNumber != null) data.registrationNumber = String(b.registrationNumber);
    if (b.beds != null) data.beds = Number(b.beds);
    if (b.founded != null) data.founded = Number(b.founded);
    if (b.about != null) data.about = String(b.about);
    if (b.specialties != null) data.specialties = JSON.stringify(b.specialties);
    const hospital = await prisma.hospital.update({ where: { id: hospitalId }, data });
    res.json(formatHospital(hospital));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update hospital profile' });
  }
});

function allowedStatusTransitions(current: string): string[] {
  const s = current.toLowerCase();
  if (s === 'jobclosed') return [];
  if (s === 'new') return ['Reviewed'];
  if (s === 'reviewed') return ['Shortlisted', 'Rejected'];
  if (s === 'shortlisted') return ['Contacted'];
  return [];
}

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

const formatCandidate = (c: any) => ({
  ...c,
  skills: safeJsonParse(c.skills, []),
  languages: safeJsonParse(c.languages, []),
  procedures: safeJsonParse(c.procedures, []),
  education: safeJsonParse(c.education, []),
  certifications: safeJsonParse(c.certifications, []),
  experience: safeJsonParse(c.experience, []),
  profile: c.profileJson ? safeJsonParse(c.profileJson, null) : null,
});

const formatApp = (app: any) => ({
  ...app,
  customFieldResponses: safeJsonParse(app.customFieldResponses, {} as Record<string, unknown>),
  candidate: formatCandidate(app.candidate),
  job: app.job
    ? {
        ...app.job,
        hospital: app.job.hospital?.name ?? app.job.hospital,
        customApplicationFields: parseJobCustomFields(app.job.customApplicationFields),
      }
    : app.job,
});

// Get applications — requires auth (recruiter sees their hospital's, candidate sees their own)
app.get('/api/applications', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    let where: any = {};
    if (req.user!.role === 'RECRUITER') {
      const hospitalId = req.user!.hospitalId;
      if (!hospitalId) {
        res.json([]);
        return;
      }
      const jobs = await prisma.job.findMany({ where: { hospitalId }, select: { id: true } });
      where = { jobId: { in: jobs.map(j => j.id) } };
    } else if (req.user!.role === 'CANDIDATE') {
      where = { candidateId: req.user!.candidateId! };
    }
    const applications = await prisma.application.findMany({
      where,
      include: { candidate: true, job: { include: { hospital: true } } },
      orderBy: { appliedOn: 'desc' },
    });
    res.json(applications.map(formatApp));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function syncFormProfile(candidateId: string, profile: any, userEmail: string) {
  const initials = String(profile.name || 'HP')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const experienceMapped = (profile.experience || []).map((e: any) => ({
    role: e.role,
    hospital: e.hospital,
    city: e.city,
    start: e.start,
    end: e.end,
    summary: e.summary,
  }));
  return prisma.candidate.update({
    where: { id: candidateId },
    data: {
      name: String(profile.name || ''),
      initials,
      role: String(profile.role || ''),
      specialty: profile.clinicalSkills?.[0] ? String(profile.clinicalSkills[0]) : String(profile.role || ''),
      experienceYears: Number(profile.yearsExperience || 0),
      location: String(profile.state || profile.city || ''),
      currentEmployer: profile.experience?.[0]?.hospital ? String(profile.experience[0].hospital) : null,
      summary: String(profile.summary || ''),
      verified: Boolean(profile.verified),
      registration: profile.registrationNumber
        ? `${profile.registrationNumber}${profile.registrationCouncil ? ` (${profile.registrationCouncil})` : ''}`
        : null,
      email: String(profile.email || userEmail),
      phone: profile.phone ? String(profile.phone) : null,
      languages: JSON.stringify(profile.languages || []),
      procedures: JSON.stringify(profile.procedures || []),
      skills: JSON.stringify([...(profile.clinicalSkills || []), ...(profile.technicalSkills || [])]),
      education: JSON.stringify(profile.qualifications || []),
      certifications: JSON.stringify(profile.certifications || []),
      experience: JSON.stringify(experienceMapped),
      matchPercent: Number(profile.completeness || 70),
      profileJson: JSON.stringify(profile),
      cvSource: 'form',
      uploadedCvName: null,
      uploadedCvMime: null,
      uploadedCvData: null,
    },
  });
}

// Create application — candidate only
app.post('/api/applications', requireAuth, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
  const { jobId, profile, cvSource, uploadedCv, customFieldResponses } = req.body;
  const candidateId = req.user!.candidateId;
  if (!candidateId) {
    res.status(400).json({ error: 'No candidate profile linked to your account' });
    return;
  }
  if (!jobId) {
    res.status(400).json({ error: 'jobId is required' });
    return;
  }
  try {
    const job = await prisma.job.findUnique({ where: { id: String(jobId) } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    if (job.status === 'Closed') {
      res.status(400).json({ error: 'This job is no longer accepting applications' });
      return;
    }
    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: String(jobId), candidateId } },
    });
    if (existing) {
      res.status(409).json({ error: 'You have already applied to this job' });
      return;
    }

    const jobCustomFields = parseJobCustomFields(job.customApplicationFields);
    const responseCheck = validateCustomFieldResponses(jobCustomFields, customFieldResponses);
    if (!responseCheck.ok) {
      res.status(400).json({ error: responseCheck.error });
      return;
    }
    const customResponsesJson =
      Object.keys(responseCheck.normalized).length > 0
        ? JSON.stringify(responseCheck.normalized)
        : null;

    const source = cvSource === 'upload' ? 'upload' : 'form';
    let appCv: { uploadedCvName?: string | null; uploadedCvMime?: string | null; uploadedCvData?: string | null } = {};

    const attachCvIfPresent = () => {
      if (!uploadedCv?.data || !uploadedCv?.name) return;
      const maxBytes = 5 * 1024 * 1024;
      if (String(uploadedCv.data).length > maxBytes * 1.4) {
        throw new Error('CV file must be under 5MB');
      }
      appCv = {
        uploadedCvName: String(uploadedCv.name),
        uploadedCvMime: String(uploadedCv.mime || 'application/pdf'),
        uploadedCvData: String(uploadedCv.data),
      };
    };

    if (source === 'form') {
      if (!profile) {
        res.status(400).json({ error: 'Profile is required for form applications' });
        return;
      }
      await syncFormProfile(candidateId, profile, req.user!.email);
      try {
        attachCvIfPresent();
      } catch (e) {
        res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid attachment' });
        return;
      }
    } else {
      if (!uploadedCv?.data || !uploadedCv?.name) {
        res.status(400).json({ error: 'CV file is required for upload applications' });
        return;
      }
      try {
        attachCvIfPresent();
      } catch (e) {
        res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid CV file' });
        return;
      }
      const contact = uploadedCv.contact || {};
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          name: String(contact.name || req.user!.name),
          email: String(contact.email || req.user!.email),
          phone: contact.phone ? String(contact.phone) : null,
          cvSource: 'upload',
          profileJson: null,
          uploadedCvName: appCv.uploadedCvName,
          uploadedCvMime: appCv.uploadedCvMime,
          uploadedCvData: appCv.uploadedCvData,
          initials: String(contact.name || req.user!.name)
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase(),
        },
      });
    }

    const application = await prisma.application.create({
      data: {
        jobId: String(jobId),
        candidateId,
        status: 'New',
        cvSource: source,
        customFieldResponses: customResponsesJson,
        ...appCv,
      },
      include: { candidate: true, job: { include: { hospital: true } } },
    });
    res.status(201).json(formatApp(application));
  } catch (error: any) {
    console.error(error);
    // Prisma unique constraint violation → duplicate application
    if (error?.code === 'P2002') {
      res.status(409).json({ error: 'You have already applied to this job' });
      return;
    }
    const msg = typeof error?.message === 'string' ? error.message : 'Failed to submit application';
    res.status(400).json({ error: msg.slice(0, 200) });
  }
});

// Update application status — recruiter only
app.patch('/api/applications/:id', requireAuth, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ error: 'status is required' });
    return;
  }
  try {
    const existing = await prisma.application.findUnique({
      where: { id: String(req.params.id) },
      include: { job: true },
    });
    if (!existing) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    if (req.user!.hospitalId && existing.job.hospitalId !== req.user!.hospitalId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    const allowed = allowedStatusTransitions(existing.status);
    if (!allowed.includes(String(status))) {
      res.status(400).json({
        error: `Cannot move from ${existing.status} to ${status}. Follow: Reviewed → Shortlisted/Rejected → Contacted (from Shortlisted only).`,
      });
      return;
    }
    const application = await prisma.application.update({
      where: { id: String(req.params.id) },
      data: { status: String(status) },
    });
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── CANDIDATES ───────────────────────────────────────────────────────────────

app.get('/api/candidates', requireAuth, requireRole('RECRUITER'), async (_req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({ include: { applications: true } });
    res.json(candidates.map(formatCandidate));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync candidate profile from portal form
app.put('/api/candidates/me', requireAuth, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
  const candidateId = req.user!.candidateId;
  if (!candidateId) {
    res.status(400).json({ error: 'No candidate profile linked to your account' });
    return;
  }
  const { profile } = req.body;
  if (!profile) {
    res.status(400).json({ error: 'profile is required' });
    return;
  }
  try {
    const initials = String(profile.name || 'HP')
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const experienceMapped = (profile.experience || []).map((e: any) => ({
      role: e.role,
      hospital: e.hospital,
      city: e.city,
      start: e.start,
      end: e.end,
      summary: e.summary,
    }));
    const candidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        name: String(profile.name || ''),
        initials,
        role: String(profile.role || ''),
        specialty: profile.clinicalSkills?.[0] ? String(profile.clinicalSkills[0]) : String(profile.role || ''),
        experienceYears: Number(profile.yearsExperience || 0),
        location: String(profile.state || profile.city || ''),
        currentEmployer: profile.experience?.[0]?.hospital ? String(profile.experience[0].hospital) : null,
        summary: String(profile.summary || ''),
        verified: Boolean(profile.verified),
        registration: profile.registrationNumber
          ? `${profile.registrationNumber}${profile.registrationCouncil ? ` (${profile.registrationCouncil})` : ''}`
          : null,
        email: String(profile.email || req.user!.email),
        phone: profile.phone ? String(profile.phone) : null,
        languages: JSON.stringify(profile.languages || []),
        procedures: JSON.stringify(profile.procedures || []),
        skills: JSON.stringify([...(profile.clinicalSkills || []), ...(profile.technicalSkills || [])]),
        education: JSON.stringify(profile.qualifications || []),
        certifications: JSON.stringify(profile.certifications || []),
        experience: JSON.stringify(experienceMapped),
        matchPercent: Number(profile.completeness || 70),
        profileJson: JSON.stringify(profile),
        cvSource: 'form',
        uploadedCvName: null,
        uploadedCvMime: null,
        uploadedCvData: null,
      },
    });
    res.json(formatCandidate(candidate));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Recruiter dashboard aggregates
app.get('/api/dashboard/stats', requireAuth, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
  try {
    const hospitalId = req.user!.hospitalId;
    if (!hospitalId) {
      res.json({ kpis: [], chart: [], suggested: [] });
      return;
    }
    const jobs = await prisma.job.findMany({
      where: { hospitalId },
      include: { applications: true },
    });
    const jobIds = jobs.map((j) => j.id);
    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      include: { candidate: true },
      orderBy: { appliedOn: 'desc' },
    });
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'Active').length;
    const totalApplicants = applications.length;
    const shortlisted = applications.filter((a) => a.status === 'Shortlisted').length;

    const weeks: { week: string; jobs: number; applications: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setHours(23, 59, 59, 999);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      const label = weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      const appsInWeek = applications.filter((a) => {
        const t = new Date(a.appliedOn).getTime();
        return t >= weekStart.getTime() && t <= weekEnd.getTime();
      }).length;
      const jobsInWeek = jobs.filter((j) => {
        const days = j.postedDays ?? 0;
        const postedAt = new Date(now);
        postedAt.setDate(postedAt.getDate() - days);
        const t = postedAt.getTime();
        return t >= weekStart.getTime() && t <= weekEnd.getTime();
      }).length;
      weeks.push({ week: label, jobs: jobsInWeek, applications: appsInWeek });
    }

    const suggested = applications.slice(0, 5).map((a) => {
      const c = a.candidate;
      return {
        id: c.id,
        name: c.name,
        initials: c.initials || '—',
        specialty: c.specialty || c.role || 'Healthcare',
        experienceYears: c.experienceYears || 0,
        location: c.location || '',
        matchPercent: c.matchPercent || 75,
      };
    });

    res.json({
      kpis: [
        { label: 'Total Jobs Posted', value: String(totalJobs), delta: totalJobs > 0 ? `+${totalJobs}` : '0' },
        { label: 'Active Jobs', value: String(activeJobs), delta: `+${activeJobs}` },
        { label: 'Total Applicants', value: String(totalApplicants), delta: `+${totalApplicants}` },
        { label: 'Shortlisted', value: String(shortlisted), delta: `+${shortlisted}` },
      ],
      chart: weeks,
      suggested,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/candidates/me', requireAuth, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
  const candidateId = req.user!.candidateId;
  if (!candidateId) {
    res.status(404).json({ error: 'Candidate profile not found' });
    return;
  }
  try {
    const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
    if (!candidate) {
      res.status(404).json({ error: 'Candidate profile not found' });
      return;
    }
    const formatted = formatCandidate(candidate);
    res.json({ ...formatted, profile: candidate.profileJson ? safeJsonParse(candidate.profileJson, null) : null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function matchesQuery(text: string, q: string): boolean {
  return text.toLowerCase().includes(q);
}

// Recruiter global search — jobs + applicants at their hospital
app.get('/api/search/recruiter', requireAuth, requireRole('RECRUITER'), async (req: AuthRequest, res: Response) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    res.json({ jobs: [], candidates: [] });
    return;
  }
  try {
    const hospitalId = req.user!.hospitalId;
    if (!hospitalId) {
      res.json({ jobs: [], candidates: [] });
      return;
    }
    const jobs = await prisma.job.findMany({
      where: { hospitalId },
      include: { hospital: true, applications: true },
    });
    const matchedJobs = jobs
      .filter((j) => {
        const tags = safeJsonParse(j.tags, [] as string[]).join(' ');
        return (
          matchesQuery(j.role, q) ||
          matchesQuery(j.specialty, q) ||
          matchesQuery(j.location, q) ||
          matchesQuery(String(j.city || ''), q) ||
          matchesQuery(tags, q) ||
          matchesQuery(j.status, q)
        );
      })
      .slice(0, 8)
      .map((j) => formatJob(j));

    const applications = await prisma.application.findMany({
      where: { job: { hospitalId } },
      include: { candidate: true, job: true },
    });
    const seen = new Set<string>();
    const matchedCandidates: any[] = [];
    for (const app of applications) {
      const c = app.candidate;
      if (seen.has(c.id)) continue;
      const hay = [
        c.name,
        c.role,
        c.specialty,
        c.location,
        c.email,
        app.job.role,
        app.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (matchesQuery(hay, q)) {
        seen.add(c.id);
        matchedCandidates.push({
          applicationId: app.id,
          candidateId: c.id,
          name: c.name,
          role: c.role,
          specialty: c.specialty,
          status: app.status,
          jobId: app.jobId,
          jobRole: app.job.role,
        });
      }
      if (matchedCandidates.length >= 8) break;
    }

    res.json({ jobs: matchedJobs, candidates: matchedCandidates });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// ─── SAVED JOBS (candidates) ─────────────────────────────────────────────────

app.get('/api/saved-jobs', requireAuth, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
  const candidateId = req.user!.candidateId;
  if (!candidateId) {
    res.json({ jobIds: [], jobs: [] });
    return;
  }
  try {
    const profile = await getCandidateProfileForMatch(req);
    const saved = await prisma.savedJob.findMany({
      where: { candidateId },
      include: { job: { include: { hospital: true, applications: true } } },
      orderBy: { savedAt: 'desc' },
    });
    const jobs = saved.map((s) => formatJob(s.job, profile));
    res.json({ jobIds: saved.map((s) => s.jobId), jobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load saved jobs' });
  }
});

app.get('/api/saved-jobs/ids', requireAuth, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
  const candidateId = req.user!.candidateId;
  if (!candidateId) {
    res.json({ jobIds: [] });
    return;
  }
  try {
    const saved = await prisma.savedJob.findMany({
      where: { candidateId },
      select: { jobId: true },
    });
    res.json({ jobIds: saved.map((s) => s.jobId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load saved job ids' });
  }
});

app.post('/api/saved-jobs', requireAuth, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
  const candidateId = req.user!.candidateId;
  const { jobId } = req.body;
  if (!candidateId) {
    res.status(400).json({ error: 'No candidate profile' });
    return;
  }
  if (!jobId) {
    res.status(400).json({ error: 'jobId is required' });
    return;
  }
  try {
    const job = await prisma.job.findUnique({ where: { id: String(jobId) } });
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    await prisma.savedJob.upsert({
      where: { candidateId_jobId: { candidateId, jobId: String(jobId) } },
      create: { candidateId, jobId: String(jobId) },
      update: { savedAt: new Date() },
    });
    res.status(201).json({ saved: true, jobId: String(jobId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save job' });
  }
});

app.delete('/api/saved-jobs/:jobId', requireAuth, requireRole('CANDIDATE'), async (req: AuthRequest, res: Response) => {
  const candidateId = req.user!.candidateId;
  if (!candidateId) {
    res.status(400).json({ error: 'No candidate profile' });
    return;
  }
  try {
    await prisma.savedJob.deleteMany({
      where: { candidateId, jobId: String(req.params.jobId) },
    });
    res.json({ saved: false, jobId: String(req.params.jobId) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove saved job' });
  }
 });
 app.post('/api/auth/google', async (req: Request, res: Response) => {
   console.log('Google login request:', req.body);
   const { access_token } = req.body;
  if (!access_token) {
     res.status(400).json({ error: 'access_token is required' });
     return;
   }
   try {
     const googleRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
       headers: { Authorization: `Bearer ${access_token}` },
    });
     if (!googleRes.ok) {
       res.status(401).json({ error: 'Invalid Google token' });
       return;
     }
     const googleUser = await googleRes.json() as { id: string; email: string; name: string };
     const { email, name } = googleUser;
    if (!email) {
     res.status(400).json({ error: 'Google account has no email' });
      return;
     }

     let user = await prisma.user.findUnique({ where: { email } });
    let candidateId: string | null = null;

     if (!user) {
       user = await prisma.user.create({
         data: { email, name, passwordHash: '', role: 'CANDIDATE' },
       });
      const candidate = await prisma.candidate.create({
        data: {
        name,
         email,
          userId: user.id,
          initials: name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
        },
      });
      candidateId = candidate.id;
     } else {
       if (user.role !== 'CANDIDATE') {
        res.status(403).json({ error: 'This Google account is registered as a recruiter. Please use the recruiter portal.' });
        return;
      }
      const candidate = await prisma.candidate.findUnique({ where: { userId: user.id } });
      candidateId = candidate?.id ?? null;
     if (!candidateId) {
       const newCandidate = await prisma.candidate.create({
         data: {
           name: user.name,
           email: user.email,
         userId: user.id,
          initials: user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
         },
       });
        candidateId = newCandidate.id;
      }
    }

    const token = jwt.sign(
       { id: user.id, email: user.email, name: user.name, role: user.role, hospitalId: user.hospitalId ?? null, candidateId },
      JWT_SECRET,
      { expiresIn: '30d' }
   );

    res.json({
     token,
     user: { id: user.id, email: user.email, name: user.name, role: user.role, hospitalId: user.hospitalId ?? null, candidateId },
   });
  } catch (error) {
   console.error(error);
    res.status(500).json({ error: 'Google login failed' });
}
 });

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
