import { Router } from 'express';
import expenseController from '../controllers/expense.controller';
import { checkLogin } from '../middleware/auth.middleware';

const expenseRouter = Router();

expenseRouter.use(checkLogin);

expenseRouter.get('/', expenseController.getAllExpenses);
expenseRouter.get('/summary', expenseController.getExpenseSummary);
expenseRouter.get('/monthly', expenseController.getMonthlyStats);
expenseRouter.get('/pending', expenseController.getPendingRequests);
expenseRouter.put('/:id/status', expenseController.respondToExpense);
expenseRouter.get('/:id', expenseController.getExpenseById);
expenseRouter.post('/', expenseController.createExpense);
expenseRouter.put('/:id', expenseController.updatedExpense);
expenseRouter.delete('/:id', expenseController.deleteExpense);

export default expenseRouter;
