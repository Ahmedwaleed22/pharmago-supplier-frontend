declare module Prescription {
  export interface Prescription {
    id: string;
    name: string;
    patient: {
      id: string;
      name: string;
    };
    file_path: string | null;
    prescription_text: string | null;
    created_at: string;
  }
}