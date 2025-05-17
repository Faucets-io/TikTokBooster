import { 
  tikTokSubmissions, 
  type Submission, 
  type InsertSubmission 
} from "@shared/schema";

export interface IStorage {
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmissions(): Promise<Submission[]>;
  getSubmission(id: number): Promise<Submission | undefined>;
  getSubmissionByUsername(username: string): Promise<Submission | undefined>;
  markAsProcessed(id: number): Promise<Submission | undefined>;
}

export class MemStorage implements IStorage {
  private submissions: Map<number, Submission>;
  private currentId: number;

  constructor() {
    this.submissions = new Map();
    this.currentId = 1;
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const id = this.currentId++;
    const newSubmission: Submission = { 
      ...submission, 
      id, 
      createdAt: new Date().toISOString(),
      processed: false
    };
    this.submissions.set(id, newSubmission);
    return newSubmission;
  }

  async getSubmissions(): Promise<Submission[]> {
    return Array.from(this.submissions.values());
  }

  async getSubmission(id: number): Promise<Submission | undefined> {
    return this.submissions.get(id);
  }

  async getSubmissionByUsername(username: string): Promise<Submission | undefined> {
    return Array.from(this.submissions.values()).find(
      (submission) => submission.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async markAsProcessed(id: number): Promise<Submission | undefined> {
    const submission = this.submissions.get(id);
    if (submission) {
      const updatedSubmission = { ...submission, processed: true };
      this.submissions.set(id, updatedSubmission);
      return updatedSubmission;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
