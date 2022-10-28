export default class User {
    name: string;
    room: string;

    constructor(name: string, room: string) {
        this.name = name;
        this.room = room;
    }

    equals(other: User) {
        return this.name === other.name && this.room === other.room;
    }
}
