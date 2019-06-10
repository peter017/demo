import { Flat } from '../domain/Flat';
import AppUtils from '../utils/AppUtils';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import mongoose, { ClientSession } from 'mongoose';
import fs from 'fs';
import db from '../config/db';
import FlatModel from '../models/FlatModel';
import { InsertWriteOpResult, BulkWriteResult } from 'mongodb';
import { DiffFlat } from '../domain/DiffFlat';

export class FlatService {
    public loadCurrentFlats(): Promise<Flat[]> {        
        return new Promise((resolve, reject) => {
            let flats: Flat[] = [];
            console.log('fetching');
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
                    // let flat = new Flat(
                    //     flatTr.getElementsByTagName('td')[0].innerHTML,
                    //     flatTr.getElementsByTagName('td')[2].innerHTML.includes('A*') ? true : false,
                    //     AppUtils.convertStringToNumber(flatTr.getElementsByTagName('td')[2].innerHTML.substr(0,1)),
                    //     AppUtils.convertStringToNumber(flatTr.getElementsByTagName('td')[3].innerHTML),
                    //     AppUtils.convertStringToNumber(flatTr.getElementsByTagName('td')[4].innerHTML),
                    //     flatTr.getElementsByTagName('td')[5].textContent,
                    //     AppUtils.convertStringToNumber(flatTr.getElementsByTagName('td')[7].getElementsByClassName('status')[0].textContent.toString().substr(0,1)),
                    //     AppUtils.trimTimeFromDate(new Date())
                    // );
    
                    // flats.push(flat);
                }

                resolve(flats);
                // fs.writeFile(`${new Date().getDate()}_${new Date().getMonth() + 1}_${new Date().getFullYear()}_flats.json`, JSON.stringify(flats) , 'utf-8');
            })
            .catch(function(err) {
                throw new Error('Failed to fetch page: ' + err);
                reject(flats);
            });
    
        })
    }

    public saveAll(flats: Flat[]): Promise<any> {
        return new Promise((resolve, reject) => {
            db.getDb().collection('flats').insertMany(flats)
            .then((result: InsertWriteOpResult) => {
                console.log(`Succesfully inserted ${result.insertedCount} records`);
                resolve();
            })
            .catch((err) => console.log('An error occured when saving records.', err.message))
        })
    }

    public saveOrUpdate(flat: Flat): Promise<any> {
        return new Promise((resolve, reject) => {
            return this.findOneById(flat.id)
            .then((flatInDB: Flat) => {
                if (flatInDB) {
                    console.log(`Updating flat: ${flat.id} in DB!`);
                    new FlatModel(flatInDB).updateOne(flat)
                    .then(() => {
                        console.log(`Flat with ID: ${flat.id} has been updated!`)
                        resolve(flat);
                    });
                } else {
                    console.log(`Saving flat: ${flat.id} to DB!`);
                    this.save(flat)
                    .then((savedFlat: Flat) => {
                        resolve(savedFlat);
                    });
                }
            });
        })
        
    }

    public save(flat: Flat): Promise<any> {
        return new Promise((resolve, reject) => {
            return new FlatModel(flat).save()
            .then((savedFlat: Flat) => {
                console.log(`Flat with ID: ${savedFlat.id} saved!`)
                resolve(savedFlat);
            })
            .catch((reason: any) => {
                console.log(`Error saving Flat with ID: ${flat.id}!`, reason)
                reject(reason);
            });
        });
    }

    public findOneById(id: String): Promise<any>  {
        console.log('Finding flat with ID: ', id);
        return db.getDb().collection('flats').findOne({ 'id': id })
        .then((result: Flat) => {
            if (result) {
                console.log('Flat found!', result);
            } else {
                console.log('Flat was not found!', result);
            }
            return result;
        })
    }

    public findAll(): Promise<Flat[]> {
        return db.getDb().collection('flats').find().toArray()
        .then(results => results)
    }

    public compareFlat(flat1: Flat, flat2: Flat): string {
        const diffFlat: DiffFlat = new DiffFlat(flat1, flat2);
        return this.createFlatDiffReport(diffFlat);
    }

    public createFlatDiffReport(diffFlat: DiffFlat): string {
        let resultString: string = '';
        
        resultString += diffFlat.getIsApartmentChanged ? AppUtils.diffReportClause(diffFlat, 'isApartment') : '';
        resultString += diffFlat.getRoomsChanged ? AppUtils.diffReportClause(diffFlat, 'rooms') : '';
        resultString += diffFlat.getSizeChanged ? AppUtils.diffReportClause(diffFlat, 'size') : '';
        resultString += diffFlat.getExternalSizeChanged ? AppUtils.diffReportClause(diffFlat, 'externalSize') : '';
        resultString += diffFlat.getPriceChanged ? AppUtils.diffReportClause(diffFlat, 'priceWithVat') : '';
        resultString += diffFlat.getStatusChanged ? AppUtils.diffReportClause(diffFlat, 'status') : '';

        resultString += JSON.stringify(diffFlat);
        return resultString;
    }
}