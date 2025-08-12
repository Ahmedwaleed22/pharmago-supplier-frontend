import { PrescriptionStatus } from "@/enums/prescription-status";

declare namespace Prescription {
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
    status: string;
  }

  export interface PrescriptionStatus {
    status: PrescriptionStatus;
  }
}