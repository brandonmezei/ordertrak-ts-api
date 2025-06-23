import { Schema, model, Document, Types } from "mongoose";
import { CommonFields } from "./CommonFields";

export interface IChangeLog extends Document {
  RollOutDate: Date;
  Details: Types.ObjectId[];

  // Inherited
  CreateDate: Date;
  CreateName: string;
  UpdateDate?: Date;
  UpdateName?: string;
  IsDelete: boolean;
  FormID: string;
}

const ChangeLogSchema = new Schema<IChangeLog>({
  RollOutDate: { type: Date, required: true, default: () => new Date() },
  Details: [{ type: Schema.Types.ObjectId, ref: "ChangeLogDetails" }],
  ...CommonFields,
});

export const ChangeLog = model<IChangeLog>("ChangeLog", ChangeLogSchema);
