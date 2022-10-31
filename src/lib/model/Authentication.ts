export class Authentication {
    token: string;
    decoded: any;

    constructor(token: string) {
        this.token = token;
        this.decoded = JSON.parse(window.atob(token.split(".")[1]));
    }
}