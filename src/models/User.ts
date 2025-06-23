import { Schema, model, Document } from 'mongoose';
import { CommonFields } from './CommonFields';

export interface IUser extends Document {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;

  // Normalized
  EmailNormalized: string;

  // Inherited
  CreateDate: Date;
  CreateName: string;
  UpdateDate?: Date;
  UpdateName?: string;
  IsDelete: boolean;
}

const UserSchema = new Schema<IUser>({
  FirstName: { type: String, required: true, maxlength: 50 },
  LastName: { type: String, required: true, maxlength: 50 },
  Email: { type: String, required: true, unique:true, maxlength: 100 },
  Password: { type: String, required: true, maxlength: 100 },
  EmailNormalized: { type: String, required: true, unique:true, maxlength: 100 },
  ...CommonFields,
});

export const User = model<IUser>('User', UserSchema);
