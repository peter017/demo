import { Flat } from '../domain/Flat';
import AppUtils from '../utils/AppUtils';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import mongoose from 'mongoose';
import fs from 'fs';
import db from '../config/db';

export class FlatService {
    public loadCurrentFlats(): Flat[] {
        let flats: Flat[] = [];

        fetch('https://www.cubicongardens.sk/ponuka/byty-cennik')
        .then((response): Promise<string> => {
            // When the page is loaded convert it to text
            return response.text();
        })
        .then((html: string) => {
            // Initialize the DOM parser
            const dom = new JSDOM(html);
    
            // Parse the text
            const doc: Document = dom.window.document;

            const rows = doc.getElementsByTagName('table')[0].getElementsByTagName('tr');
           
            for(let i = 1; i < rows.length; i ++) {
                let flatTr = rows[i];
                let flat = new Flat(
                    flatTr.getElementsByTagName('td')[0].innerHTML,
                    flatTr.getElementsByTagName('td')[2].innerHTML.includes('A*') ? true : false,
                    AppUtils.convertStringToNumber(flatTr.getElementsByTagName('td')[2].innerHTML.substr(0,1)),
                    AppUtils.convertStringToNumber(flatTr.getElementsByTagName('td')[3].innerHTML),
                    AppUtils.convertStringToNumber(flatTr.getElementsByTagName('td')[4].innerHTML),
                    flatTr.getElementsByTagName('td')[5].textContent,
                    AppUtils.convertStringToNumber(flatTr.getElementsByTagName('td')[7].getElementsByClassName('status')[0].textContent.toString().substr(0,1)),
                    new Date().toLocaleDateString()
                );
                // console.log(flat);
                flats.push(flat);
            }

            let FlatModel = flats[0].getModelForClass(Flat);
            new FlatModel(flats[0]).save();

            // db.getDb().collection('flats').save({ test: 'test' })

            // fs.writeFile(`${new Date().getDate()}_${new Date().getMonth() + 1}_${new Date().getFullYear()}_flats.json`, JSON.stringify(flats) , 'utf-8');
            // this.saveOrUpdate(flats[1])
            // .then((res) => this.findOneById(res.id))
            // .catch(err => console.log(err, '!!!ERR'));
        })
        // .catch(function(err) {
        //     throw new Error('Failed to fetch page: ' + err);
        // });
        

        return flats;
    }

    public saveOrUpdate(flat: Flat): Promise<Flat> {
        const FlatModel = flat.getModelForClass(Flat);
        return new FlatModel(flat).save((err) => console.log(err));
        // return this.findOneById(flat.id)
        // .then((flatInDB: Flat) => {
        //     if (flatInDB) {
        //         console.log(`Updating flat: ${flat.id} to DB!`);
        //         return new FlatModel(flatInDB).updateOne(flat);
        //     } else {
        //         console.log(`Saving flat: ${flat.id} to DB!`);
        //         return new FlatModel(flat).save();
        //     }
        // });
    }

    public findOneById(id: String): Promise<Flat>  {
        console.log('Finding flat with ID: ', id);
        return db.getDb().collection('flats').findOne({ 
            '_id': id
        })
        .then(result => {
            console.log('Flat found!', result);
            return result;
        })
    }

    public findAll(): Promise<Flat[]> {
        return db.getDb().collection('flats').find().toArray()
        .then(results => results)
    }

    public compareFlat(oldFlat: Flat, newFlat: Flat): Flat {
        if (oldFlat.id !== newFlat.id) {
            throw new Error('Compared flats do not share the same ID!');
        }

        let diffFlat: Flat = Flat.createFlat();        
        
        diffFlat.isApartment = oldFlat.isApartment === newFlat.isApartment ? diffFlat.isApartment : newFlat.isApartment;
        diffFlat.rooms = oldFlat.rooms === newFlat.rooms ? diffFlat.rooms : newFlat.rooms;
        diffFlat.size = oldFlat.size === newFlat.size ? diffFlat.size : newFlat.size;
        diffFlat.externalSize = oldFlat.externalSize === newFlat.externalSize ? diffFlat.externalSize : newFlat.externalSize;
        diffFlat.priceWithVat = oldFlat.priceWithVat === newFlat.priceWithVat ? diffFlat.priceWithVat : newFlat.priceWithVat;
        diffFlat.status = oldFlat.status === newFlat.status ? diffFlat.status : newFlat.status;
        diffFlat['isApartment'] = this.compareFlatProperty('isApartment');
        Object.keys(diffFlat).forEach(key => console.log(diffFlat[key]))
    }
}