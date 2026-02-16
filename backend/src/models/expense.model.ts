import mongoose, { Schema, Document } from 'mongoose';

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Rent'
  | 'Household'
  | 'Health'
  | 'Education'
  | 'Other';
export type ExpenseStatus = 'Pending' | 'Accepted' | 'Personal'| 'Rejected';;

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: ExpenseCategory;
  note?: string;
  status: ExpenseStatus;
  paidBy: mongoose.Types.ObjectId;
  sharedWith?: mongoose.Types.ObjectId | null;
  sharedWithEmail?: string; // Added by Bella - Added email field to the interface
  date: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Food', 'Transport', 'Rent', 'Household', 'Health', 'Education', 'Other'],
    },
    note: { type: String, default: '' },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Accepted', 'Personal'],
      default: 'Pending',
    },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    sharedWithEmail: { type: String, default: null }, // Added by Bella - Added email field to the schema
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);