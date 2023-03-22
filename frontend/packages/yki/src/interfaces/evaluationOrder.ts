import { Dayjs } from 'dayjs';

export interface ExaminationParts {
  readingComprehension: boolean;
  speechComprehension: boolean;
  speaking: boolean;
  writing: boolean;
}

export interface PayerDetails {
  firstNames?: string;
  lastName?: string;
  email?: string;
  birthdate?: Dayjs;
}

export type Subtest = 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING';

export interface EvaluationOrderRequest {
  first_names: string;
  last_name: string;
  email: string;
  birthdate: string;
  subtests: Array<Subtest>;
}

export interface EvaluationOrderResponse {
  evaluation_order_id: number;
  signature: string;
  redirect: string;
}