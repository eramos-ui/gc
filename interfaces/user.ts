export interface IUser {
    _id              : string;
    organization?    : string;
    idUsuario        : number;
    email            : string;
    name             : string;
    password?        : string;//esto no estará en el FE
    role             : string;
    nameOrganization?: string;
    createdAt?       : string;//este par probablemente no estará en el FE
    updatedAt?       : string;

}