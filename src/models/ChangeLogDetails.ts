import { Schema, model, Document } from 'mongoose';
import { CommonFields } from './CommonFields';

export interface IChangeLogDetails extends Document {
    TicketInfo :string;

    // Inherited
    CreateDate: Date;
    CreateName: string;
    UpdateDate?: Date;
    UpdateName?: string;
    IsDelete: boolean;
    FormID: string;
}

const ChangeLogDetailsSchema = new Schema<IChangeLogDetails>({
    TicketInfo: { type: String, required: true, maxlength: 1000 },
    ...CommonFields,
});

export const ChangeLogDetails = model<IChangeLogDetails>('ChangeLogDetails', ChangeLogDetailsSchema);