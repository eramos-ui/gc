export interface IOrganization {
    _id           : string;
    idOrganization: number;
    name          : string;
    isVigente     : boolean;

    createdAt?: string;//este par probablemente no estará en el FE
    updatedAt?: string;

}