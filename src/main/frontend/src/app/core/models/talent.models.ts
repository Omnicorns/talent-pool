export interface TalentSession {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  candidateId: string;
  email: string;
  fullName: string;
}

export interface EducationItem {
  id?: string;
  type: 'FORMAL' | 'INFORMAL';
  level?: string | null;
  institution: string;
  major?: string | null;
  startYear?: number | null;
  endYear?: number | null;
  description?: string | null;
  ipk?: string | null;
}

export interface WorkExperienceItem {
  id?: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string | null;
  currentJob: boolean;
  description?: string | null;
}

export interface PortfolioItem {
  id?: string;
  type: string;
  title: string;
  url?: string | null;
  originalName?: string | null;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate?: string | null;
  identityNumber?: string | null;
  about?: string | null;
  languanges?: string | null;
  religion?: string | null;
  citizenIdAddress?: string | null;
  residentialAddress?: string | null;
  sameAsCitizenIdAddress: boolean;
  currentSalary?: number | null;
  expectedSalary?: number | null;
  source?: string | null;
  status?: string | null;
  termsAccepted: boolean;
  movedToJobListing: boolean;
  jobPosition?: string | null;
  hiringStage?: string | null;
  cvOriginalName?: string | null;
  profilePictureOriginalName?: string | null;
  relatedIndustries: string[];
  relatedJobPositions: string[];
  tools: string[];
  jobInterests: string[];
  preferredLocations: string[];
  educations: EducationItem[];
  workExperiences: WorkExperienceItem[];
  portfolios: PortfolioItem[];
}

export interface JobListing {
  id: string;
  title: string;
  department?: string | null;
  location?: string | null;
  employmentType?: string | null;
  description?: string | null;
  requirements?: string | null;
  applicationDeadline?: string | null;
  status?: string | null;
}

export interface JobApplication {
  id: string;
  jobListingId?: string;
  jobTitle: string;
  stage?: string | null;
  status?: string | null;
  appliedAt?: string | null;
  updatedAt?: string | null;
}
