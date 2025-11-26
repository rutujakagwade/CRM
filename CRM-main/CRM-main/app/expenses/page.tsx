'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCRMStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, DollarSign, TrendingUp, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ExpenseDialog } from '@/components/expenses/expense-dialog';

export default function ExpensesPage() {
  const expenses = useCRMStore((state) => state.expenses);
  const fetchExpenses = useCRMStore((state) => state.fetchExpenses);
  const fetchOpportunities = useCRMStore((state) => state.fetchOpportunities);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchExpenses();
    fetchOpportunities();
  }, [fetchExpenses, fetchOpportunities]);

  // Filtered and sorted expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter((expense) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = expense.title.toLowerCase().includes(query);
        const matchesDescription = expense.description?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && expense.category !== categoryFilter) return false;

      // Date range filter
      if (dateFrom) {
        const expenseDate = new Date(expense.date);
        const fromDate = new Date(dateFrom);
        if (expenseDate < fromDate) return false;
      }
      if (dateTo) {
        const expenseDate = new Date(expense.date);
        const toDate = new Date(dateTo);
        if (expenseDate > toDate) return false;
      }

      // Amount range filter
      if (amountMin && Number(expense.amount) < Number(amountMin)) return false;
      if (amountMax && Number(expense.amount) > Number(amountMax)) return false;

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = Number(a.amount);
          bValue = Number(b.amount);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [expenses, searchQuery, categoryFilter, dateFrom, dateTo, amountMin, amountMax, sortBy, sortOrder]);

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const filteredTotalExpenses = filteredAndSortedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const monthlyData = filteredAndSortedExpenses.reduce((acc, expense) => {
    const month = format(new Date(expense.date), 'MMM yyyy');
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      existing.amount += Number(expense.amount);
    } else {
      acc.push({ month, amount: Number(expense.amount) });
    }
    return acc;
  }, [] as { month: string; amount: number }[]);

  const thisMonthExpenses = filteredAndSortedExpenses.filter((e) =>
    format(new Date(e.date), 'MMM yyyy') === format(new Date(), 'MMM yyyy')
  ).reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Meals">Meals</SelectItem>
                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                  <SelectItem value="Software">Software</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="dateFrom" className="text-xs">From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo" className="text-xs">To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label>Amount Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="amountMin" className="text-xs">Min</Label>
                  <Input
                    id="amountMin"
                    type="number"
                    placeholder="0"
                    value={amountMin}
                    onChange={(e) => setAmountMin(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="amountMax" className="text-xs">Max</Label>
                  <Input
                    id="amountMax"
                    type="number"
                    placeholder="10000"
                    value={amountMax}
                    onChange={(e) => setAmountMax(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <Label>Sort By</Label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setDateFrom('');
                setDateTo('');
                setAmountMin('');
                setAmountMax('');
                setSortBy('date');
                setSortOrder('desc');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4 sm:space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Expenses</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Track your business expenses
              {filteredAndSortedExpenses.length !== expenses.length && (
                <span className="ml-2 text-sm">
                  ({filteredAndSortedExpenses.length} of {expenses.length} shown)
                </span>
              )}
            </p>
          </div>
          <Button className="w-full sm:w-auto" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">₹{filteredTotalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{filteredAndSortedExpenses.length} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ₹{filteredAndSortedExpenses.length > 0 ? (filteredTotalExpenses / filteredAndSortedExpenses.length).toFixed(2) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              ₹{thisMonthExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Opportunity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No expenses match your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedExpenses.slice(0, 10).map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>${Number(expense.amount).toLocaleString()}</TableCell>
                      <TableCell>{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{expense.opportunity?.title || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredAndSortedExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No expenses match your filters
              </div>
            ) : (
              filteredAndSortedExpenses.slice(0, 10).map((expense) => (
                <div key={expense.id} className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{expense.title}</h3>
                    <span className="font-bold text-sm">${Number(expense.amount).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{expense.category}</span>
                    <span>{format(new Date(expense.date), 'MMM dd, yyyy')}</span>
                  </div>
                  {expense.opportunity?.title && (
                    <div className="text-xs text-muted-foreground">
                      Opportunity: {expense.opportunity.title}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ExpenseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
      </div>
    </div>
  );
}
