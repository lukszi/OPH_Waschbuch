export default class Machine{
    name: string;
    constructor(name: string) {
        this.name = name;
    }

    equals(other: Machine) {
        return this.name === other.name;
    }
}