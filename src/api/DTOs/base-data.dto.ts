export interface StudentDTO {
    status: 'EXACT' | 'CLOSE' | 'UNPAIRED',
    name: string,
    email: string,
    monday: string[],
    tuesday: string[],
    wednesday: string[],
    thursday: string[],
    friday: string[],
    subjects: string[],
    mentor: MentorDTO,
}


export interface AdminDTO {
    name: string,
    email: string,
    isViewOnly: boolean,
    uuid: string,
}

export interface MentorDTO {
    name: string,
    monday: string[],
    tuesday: string[],
    wednesday: string[],
    thursday: string[],
    friday: string[],
    subjects: string[],
    students: StudentDTO[],
}