export interface IPatient {
    name: string;
    patient_number: number;
    nif: number;
    birthday: string;
    email: null | string;
    address: string;
    postal_code: string;
    postal_code_address: string;
    transport_feature: string;
    patient_responsible: null | string;
    phone_number: number;
    patient_observations: string;
    status: null | number;
}
