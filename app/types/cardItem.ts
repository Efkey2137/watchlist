export interface Item {
    id: string; // Dodajemy ID z bazy
    name: string;
    status: string;
    score?: number;
    tier?: string;
    type?: string;
    createdAt?: any;
    order?: number;
    userId?: string;
}