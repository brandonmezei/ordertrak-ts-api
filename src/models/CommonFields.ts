export const CommonFields = {
  CreateDate: { type: Date, required: true, default: () => new Date() },
  CreateName: { type: String, required: true, maxlength: 50 },
  UpdateDate: { type: Date, default: null },
  UpdateName: { type: String, maxlength: 50, default: null },
  IsDelete: { type: Boolean, required: true, default: false },
  FormID: { type: String, required: true, default: () => crypto.randomUUID() },
};
