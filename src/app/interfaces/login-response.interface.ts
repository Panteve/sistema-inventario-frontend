export interface LoginResponseInterface {
    access_token: string;
    user: {
        id: number;
        document: string;
        role: string;
        officeId?: number;
        officeName?: string;
    };
}
