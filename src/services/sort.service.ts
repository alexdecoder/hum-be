import { Injectable, NotImplementedException } from "@nestjs/common";
import { parse } from "csv-parse";
import { PrismaService } from "./prisma.service";

@Injectable()
export class SortService {
    constructor(private readonly prisma: PrismaService) {}

    private async parseTsv(data: string): Promise<any[]> {
        return new Promise<any>((resolve, reject) => {
            parse(data,
            {
                delimiter: "\t",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                }
        
                resolve(result);
            });
        });
    }

    private async parseSubset(subset: string) {
        return new Promise<any>((resolve, reject) => {
            parse(subset,
            (error, result) => {
                if (error) {
                    reject(error);
                }
        
                resolve(result[0]);
            });
        });
    }

    async importStudentsData(data: string) {
        // Clear existing students
        await this.prisma.student.deleteMany();

        const parsedData = await this.parseTsv(data);
        // Remove headers from dataset
        parsedData.shift();

        const keyMappings = [
            'mon',
            'tues',
            'wed',
            'thrs',
            'fri',
            'subjects',
        ];

        for(let student of parsedData) {
            // Initialize empty buffer for parsed subset data
            let parsedSubsetBuffer = new Map<string, string[]>();

            // Get operable columns
            const parseableColumns: any[] = student.slice(2, 8);
            let i = 0;
            for(let key of keyMappings) {
                parsedSubsetBuffer.set(
                    key,
                    await this.parseSubset(parseableColumns[i]),
                );

                i++;
            }

            await this.prisma.student.create({
                data: {
                    name: student[0], // Name is column one
                    email: student[1].toLowerCase(), // Email is column two
                    mon: parsedSubsetBuffer.get('mon'),
                    tues: parsedSubsetBuffer.get('tues'),
                    wed: parsedSubsetBuffer.get('wed'),
                    thrs: parsedSubsetBuffer.get('thrs'),
                    fri: parsedSubsetBuffer.get('fri'),
                    subject: parsedSubsetBuffer.get('subjects'),
                }
            });
        }
    }
}