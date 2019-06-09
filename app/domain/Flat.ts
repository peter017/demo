import { FlatState } from "./FlatState";
import { prop, Typegoose, ModelType, InstanceType } from 'typegoose';
import { Types } from "mongoose";


export class Flat extends Typegoose {
    // @prop()
    id: string;
    @prop()
    isApartment: boolean;
    // @prop()
    rooms: number;
    // @prop()
    size: number;
    // @prop()
    externalSize: number;
    // @prop()
    priceWithVat: string;
    // @prop()
    status: FlatState;
    // @prop()
    snapshotDate: Date;

    constructor(id: string, isApartment: boolean, rooms: number, size: number, externalSize: number, priceWithVat: string, status: FlatState, snapshotDate: Date) {
        super();
        this.id = id;
        this.isApartment = isApartment;
        this.rooms = rooms;
        this.size = size;
        this.externalSize = externalSize;
        this.priceWithVat = priceWithVat;
        this.status = status;
        this.snapshotDate = snapshotDate;
    }

    static createFlat(): Flat {
        return new Flat('', false, 0, 0, 0, '', FlatState.voľný, new Date());
    }

    static generateFlatId(flatNumber: number, date: Date): string {
        return `${flatNumber}-${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`;
    }
}