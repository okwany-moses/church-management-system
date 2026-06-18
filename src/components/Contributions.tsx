import React, { useEffect, useState } from "react";
import { api } from "../api";
import { Contribution, Member, Branch, CellGroup, Expenditure, LedgerSummary } from "../types";
import { 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  DollarSign, 
  Calendar, 
  CreditCard,
  User, 
  Coins, 
  PiggyBank, 
  ArrowUpDown,
  X,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Layers,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { downloadCSV } from "../utils/exporter";

interface ContributionsProps {
  onDataChange?: () => void;
  isAdmin?: boolean;
}

type FinanceTab = "ledger" | "incomes" | "expenditures";

export default function Contributions({ onDataChange, isAdmin = true }: ContributionsProps) {
  const [activeSubTab, setActiveSubTab] = useState<FinanceTab>("ledger");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Entities state
  const [members, setMembers] = useState<Member[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);
  const [ledger, setLedger] = useState<LedgerSummary | null>(null);

  // Bulk Delete states
  const [selectedIncomeIds, setSelectedIncomeIds] = useState<number[]>([]);
  const [selectAllIncomes, setSelectAllIncomes] = useState(false);
  const [selectedExpenseIds, setSelectedExpenseIds] = useState<number[]>([]);
  const [selectAllExpenses, setSelectAllExpenses] = useState(false);

  // Search & Filters for income
  const [incSearch, setIncSearch] = useState("");
  const [incType, setIncType] = useState("All");
  const [incMonth, setIncMonth] = useState("All");
  const [incYear, setIncYear] = useState("All");
  const [incCellGroup, setIncCellGroup] = useState("All");
  const [incMethod, setIncMethod] = useState("All");

  // Search & Filters for expenses
  const [expSearch, setExpSearch] = useState("");
  const [expCat, setExpCat] = useState("All");
  const [expBranch, setExpBranch] = useState("All");

  // Form Modals
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Import CSV states
  const [showIncomeImportModal, setShowIncomeImportModal] = useState(false);
  const [incomeCsvFile, setIncomeCsvFile] = useState<File | null>(null);
  const [showExpenseImportModal, setShowExpenseImportModal] = useState(false);
  const [expenseCsvFile, setExpenseCsvFile] = useState<File | null>(null);

  // Form State - Incomes
  const [incAmount, setIncAmount] = useState("");
  const [incTypeVal, setIncTypeVal] = useState("Tithe");
  const [incDate, setIncDate] = useState("");
  const [incPaymentMethod, setIncPaymentMethod] = useState("Online");
  const [incNotes, setIncNotes] = useState("");
  const [incMemberId, setIncMemberId] = useState("");
  const [incIsAnonymous, setIncIsAnonymous] = useState(false);
  const [incBranchId, setIncBranchId] = useState("");
  const [incCellGroupId, setIncCellGroupId] = useState("");
  // Searchable Member State
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [showMemberResults, setShowMemberResults] = useState(false);

  // Form State - Expenditures
  const [expTitle, setExpTitle] = useState("");
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCatVal, setExpCatVal] = useState("Utilities & Audio");
  const [expDate, setExpDate] = useState("");
  const [expBranchId, setExpBranchId] = useState("");

  // Deletion Tracking
  const [deletingIncomeId, setDeletingIncomeId] = useState<number | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contData, memData, branchData, cellData, expData, ledgerData] = await Promise.all([
        api.getContributions(),
        api.getMembers(),
        api.getBranches(),
        api.getCellGroups(),
        api.getExpenditures(),
        api.getLedgerSummary()
      ]);
      setContributions(contData);
      setMembers(memData);
      setBranches(branchData);
      setCellGroups(cellData);
      setExpenditures(expData);
      setLedger(ledgerData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load financial records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(incAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (!incIsAnonymous && !incMemberId) {
      alert("Please link this contribution to a member, or check 'Record anonymously'.");
      return;
    }

    const payload = {
      member_id: incIsAnonymous ? null : parseInt(incMemberId, 10),
      amount: amountNum,
      type: incTypeVal,
      date: incDate,
      payment_method: incPaymentMethod,
      notes: incNotes.trim() || null,
      branch_id: incBranchId ? parseInt(incBranchId, 10) : null,
      cell_group_id: incCellGroupId ? parseInt(incCellGroupId, 10) : null
    };

    try {
      await api.addContribution(payload);
      setShowIncomeModal(false);
      loadData();
      setMemberSearchTerm("");
      setShowMemberResults(false);
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Failed to submit contribution: " + err.message);
      console.error("Failed to submit contribution:", err);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (!expTitle.trim()) {
      alert("Please enter expense description details or title.");
      return;
    }

    const payload = {
      title: expTitle.trim(),
      description: expDescription.trim() || null,
      amount: amountNum,
      category: expCatVal,
      date: expDate,
      branch_id: expBranchId ? parseInt(expBranchId, 10) : null
    };

    try {
      await api.addExpenditure(payload);
      setShowExpenseModal(false);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Failed to submit expenditure: " + err.message);
      console.error("Failed to submit expenditure:", err);
    }
  };

  const handleDeleteIncome = async (id: number) => {
    try {
      await api.deleteContribution(id);
      setDeletingIncomeId(null);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Failed to delete contribution: " + err.message);
      console.error("Failed to delete contribution:", err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await api.deleteExpenditure(id);
      setDeletingExpenseId(null);
      loadData();
      if (onDataChange) onDataChange();
    } catch (err: any) {
      alert("Failed to delete expenditure: " + err.message);
      console.error("Failed to delete expenditure:", err);
    }
  };

  // Filtration logic
  const filteredIncomes = contributions.filter(c => {
    const contributor = c.first_name ? `${c.first_name} ${c.last_name}`.toLowerCase() : "anonymous";
    const matchesSearch = contributor.includes(incSearch.toLowerCase()) || 
      (c.notes && c.notes.toLowerCase().includes(incSearch.toLowerCase())) ||
      ((c as any).registration_number && (c as any).registration_number.toLowerCase().includes(incSearch.toLowerCase()));
    
    const contributionDate = new Date(c.date);
    const matchesMonth = incMonth === "All" || (contributionDate.getMonth() + 1).toString() === incMonth;
    const matchesYear = incYear === "All" || contributionDate.getFullYear().toString() === incYear;

    const matchesCellGroup = incCellGroup === "All" ||
      (c.cell_group_id && c.cell_group_id.toString() === incCellGroup);


    const matchesType = incType === "All" || c.type === incType;
    const matchesMethod = incMethod === "All" || c.payment_method === incMethod;
    return matchesSearch && matchesType && matchesMethod && matchesMonth && matchesYear && matchesCellGroup;
  });

  const filteredExpenses = expenditures.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(expSearch.toLowerCase()) || 
      (e.description && e.description.toLowerCase().includes(expSearch.toLowerCase()));
    const matchesCat = expCat === "All" || e.category === expCat;
    const matchesBranch = expBranch === "All" || 
      (expBranch === "HQ" && e.branch_id === 1) || 
      (expBranch !== "HQ" && e.branch_id && e.branch_id.toString() === expBranch);
    return matchesSearch && matchesCat && matchesBranch;
  });

  // Searchable members for selection
  const searchedMembers = members.filter(m => 
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    (m.phone && m.phone.includes(memberSearchTerm)) ||
    ((m as any).registration_number && (m as any).registration_number.toLowerCase().includes(memberSearchTerm.toLowerCase()))
  );

  // Bulk Delete Logic
  const toggleSelectIncome = (id: number) => {
    setSelectedIncomeIds(prev =>
      prev.includes(id) ? prev.filter(incomeId => incomeId !== id) : [...prev, id]
    );
  };

  const availableYears = Array.from(new Set(contributions.map(c => new Date(c.date).getFullYear())))
    .sort((a, b) => b - a)
    .map(String);

  const handleSelectAllIncomes = () => {
    if (selectAllIncomes) {
      setSelectedIncomeIds([]);
    } else {
      setSelectedIncomeIds(filteredIncomes.map(inc => inc.id));
    }
    setSelectAllIncomes(!selectAllIncomes);
  };

  const handleDeleteSelectedIncomes = async () => {
    if (selectedIncomeIds.length === 0) {
      alert("No contributions selected for deletion.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedIncomeIds.length} selected contributions? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteContributionsBulk(selectedIncomeIds);
      setSelectedIncomeIds([]);
      setSelectAllIncomes(false);
      loadData();
      if (onDataChange) onDataChange();
      alert(`${selectedIncomeIds.length} contributions deleted successfully.`);
    } catch (err: any) {
      alert("Bulk deletion failed: " + err.message);
      console.error("Bulk deletion failed:", err);
    }
  };

  const toggleSelectExpense = (id: number) => {
    setSelectedExpenseIds(prev =>
      prev.includes(id) ? prev.filter(expenseId => expenseId !== id) : [...prev, id]
    );
  };

  const handleSelectAllExpenses = () => {
    if (selectAllExpenses) {
      setSelectedExpenseIds([]);
    } else {
      setSelectedExpenseIds(filteredExpenses.map(exp => exp.id));
    }
    setSelectAllExpenses(!selectAllExpenses);
  };

  const handleDeleteSelectedExpenses = async () => {
    if (selectedExpenseIds.length === 0) {
      alert("No expenditures selected for deletion.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${selectedExpenseIds.length} selected expenditures? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.deleteExpendituresBulk(selectedExpenseIds);
      setSelectedExpenseIds([]);
      setSelectAllExpenses(false);
      loadData();
      if (onDataChange) onDataChange();
      alert(`${selectedExpenseIds.length} expenditures deleted successfully.`);
    } catch (err: any) {
      alert("Bulk deletion failed: " + err.message);
      console.error("Bulk deletion failed:", err);
    }
  };

  // SUM Calculations
  const totalEarnedFromTithes = contributions.filter(c => c.type === "Tithe").reduce((acc, c) => acc + c.amount, 0);
  const totalEarnedFromOfferings = contributions.filter(c => c.type === "Offering").reduce((acc, c) => acc + c.amount, 0);
  const totalEarnedFromAnnualReg = contributions.filter(c => c.type === "Annual Registration").reduce((acc, c) => acc + c.amount, 0);
  const totalEarnedFromMonthlyCont = contributions.filter(c => c.type === "Monthly Contribution").reduce((acc, c) => acc + c.amount, 0);
  const totalOtherIncome = contributions.filter(c => !["Tithe", "Offering", "Annual Registration", "Monthly Contribution"].includes(c.type)).reduce((acc, c) => acc + c.amount, 0);

  const totalRevenueSum = contributions.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenditureSum = expenditures.reduce((sum, item) => sum + item.amount, 0);
  const netChurchBalance = totalRevenueSum - totalExpenditureSum;

  const formatKES = (val: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Pie chart helper
  const colorsList = ["#2D3E50", "#C5A059", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  const incomeDistribution = [
    { name: "Tithes", value: totalEarnedFromTithes },
    { name: "Offerings", value: totalEarnedFromOfferings },
    { name: "Annual Registrations", value: totalEarnedFromAnnualReg },
    { name: "Monthly Contributions", value: totalEarnedFromMonthlyCont },
    { name: "Other Donations", value: totalOtherIncome }
  ].filter(i => i.value > 0);

  // Group expenditure by category for visualization
  const expCategoriesGrouped = expenditures.reduce((acc: any, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {});

  const expenditureDistribution = Object.keys(expCategoriesGrouped).map(key => ({
    name: key,
    value: expCategoriesGrouped[key] as number
  }));

  const handleExportLedger = () => {
    const combined = [
      ...contributions.map(c => ({
        date: c.date,
        type: "Income / " + c.type,
        transaction: c.first_name ? `${c.first_name} ${c.last_name}` : "Anonymous Giver",
        category: c.type,
        payment_method: c.payment_method,
        branch_name: c.branch_name,
        cell_group_name: c.cell_group_name,
        notes: c.notes || "",
        amount: c.amount
      })),
      ...expenditures.map(e => ({
        date: e.date,
        type: "Expenditure / " + e.category,
        transaction: e.title,
        branch_name: e.branch_name,
        cell_group_name: null,
        category: e.category,
        payment_method: "Debit",
        notes: e.description || "",
        amount: e.amount
      }))
    ].sort((a, b) => b.date.localeCompare(a.date));

    downloadCSV(combined, ["Date", "Type", "Transaction", "Category", "Payment Method", "Notes", "Amount"], "GIMK-Combined-Transactions-Ledger");
  };

  const handleExportIncomes = () => {
    const data = filteredIncomes.map(item => ({
      date: item.date,
      contributor: item.first_name ? `${item.first_name} ${item.last_name}` : `Anonymous (${item.branch_name || 'No Branch'})`,
      fund_channel: item.type,
      payment_method: item.payment_method,
      notes: item.notes || "",
      amount: item.amount
    }));
    downloadCSV(data, ["Date", "Contributor", "Fund Channel", "Payment Method", "Notes", "Amount"], "GIMK-Fund-Contributions-Report");
  };

  const handleExportExpenditures = () => {
    const data = filteredExpenses.map(item => ({
      date: item.date,
      title: item.title,
      category: item.category,
      branch: item.branch_name || "Headquarters HQ",
      notes: item.description || "",
      amount: item.amount
    }));
    downloadCSV(data, ["Date", "Title", "Category", "Branch", "Notes", "Amount"], "GIMK-Church-Expenditures-Report");
  };

  // CSV Import Logic
  const handleImportIncomeCsv = async () => {
    if (!incomeCsvFile) {
      alert("Please select a CSV file to upload for incomes.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', incomeCsvFile);
      const response = await api.importContributionsCsv(formData);
      alert(response.message || "Income import successful!");
      setShowIncomeImportModal(false);
      loadData();
    } catch (err: any) {
      alert("Income import failed: " + (err.message || "Unknown error"));
      console.error("Income import failed:", err);
    }
  };

  const handleImportExpenseCsv = async () => {
    if (!expenseCsvFile) {
      alert("Please select a CSV file to upload for expenditures.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', expenseCsvFile);
      const response = await api.importExpendituresCsv(formData);
      alert(response.message || "Expenditure import successful!");
      setShowExpenseImportModal(false);
      loadData();
    } catch (err: any) {
      alert("Expenditure import failed: " + (err.message || "Unknown error"));
      console.error("Expenditure import failed:", err);
    }
  };

  interface CsvImportModalProps {
    show: boolean;
    onClose: () => void;
    onImport: () => void;
    expectedHeaders: string;
    title: string;
    setFile: (file: File | null) => void;
  }

  // Common CSV import modal component
  const CsvImportModal = ({ show, onClose, onImport, expectedHeaders, title, setFile }: CsvImportModalProps) => (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-neutral-150">
            <div className="mb-4 flex items-center justify-between border-b pb-3"><h2 className="font-display text-lg font-bold text-neutral-900">{title}</h2><button onClick={onClose} className="rounded-lg p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition"><X className="h-4 w-4" /></button></div>
            <div className="space-y-4 text-xs font-sans"><p className="text-neutral-600">Upload a CSV file. Ensure your CSV has the following headers:</p><div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-neutral-700 font-mono text-[10px] overflow-x-auto">{expectedHeaders}</div><input type="file" accept=".csv" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="w-full text-xs text-neutral-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#C5A059] file:text-[#2D3E50] hover:file:bg-[#b08e4d] file:cursor-pointer" /><div className="flex gap-2 justify-end border-t border-[#E5E1D8] pt-4"><button type="button" onClick={onClose} className="h-10 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F5F2ED] px-4 font-bold uppercase tracking-wider text-[#2D3E50] transition cursor-pointer">Cancel</button><button type="button" onClick={onImport} className="h-10 rounded-xl bg-[#2D3E50] hover:bg-[#1e2a36] px-5 font-bold uppercase tracking-wider text-[#C5A059] transition cursor-pointer shadow-sm shadow-[#2D3E50]/15"><UploadCloud className="h-4 w-4" />Upload & Import</button></div></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#E5E1D8] pb-5">
        <div>
          <h1 className="font-display font-black text-2xl text-[#2D3E50] tracking-tight uppercase">
            Gideons Int. Ministries Kenya Ledger
          </h1>
          <p className="text-xs text-[#636E72] font-semibold mt-1">
            Accounts dashboard for tithes, offerings, annual registration dues, monthly contributions, and expenditures.
          </p>
        </div>
        
        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
        {isAdmin && (
          <>
            <button
              onClick={() => {
                setIncAmount("");
                setIncTypeVal("Tithe");
                setIncDate(new Date().toISOString().split("T")[0]);
                setIncPaymentMethod("Online");
                setIncNotes("");
                setIncMemberId("");
                setIncIsAnonymous(false);
                setMemberSearchTerm("");
                setShowMemberResults(false);
                setShowIncomeModal(true);
              }}
              className="h-10 rounded-xl bg-[#2D3E50] hover:bg-[#1e2a36] px-4 font-bold uppercase tracking-wider text-[#C5A059] flex items-center gap-2 transition cursor-pointer shadow-sm shadow-[#2D3E50]/15"
            >
              <Plus className="h-4 w-4 text-[#C5A059]" />
              Record Income Contribution
            </button>
            <button
              onClick={() => {
                setExpTitle("");
                setExpDescription("");
                setExpAmount("");
                setExpCatVal("Utilities & Audio");
                setExpDate(new Date().toISOString().split("T")[0]);
                setExpBranchId("");
                setShowExpenseModal(true);
              }}
              className="h-10 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 font-bold uppercase tracking-wider text-amber-800 flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="h-4 w-4 text-amber-700" />
              File Church Expenditure
            </button>
            <button
              onClick={() => setShowIncomeImportModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D8] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 transition cursor-pointer"
              title="Import contributions from CSV file"
            >
              <UploadCloud className="h-4 w-4 text-blue-600" />
              <span>Import Income CSV</span>
            </button>


          </>
        )}
        </div>
      </div>

      {/* Sub tabs line */}
      <div className="flex border-b border-[#E5E1D8]">
        {[
          { id: "ledger", label: "Accounts Summary Ledger", icon: FileSpreadsheet },
          { id: "incomes", label: "Contributions Register (Incomes)", icon: ArrowUpRight },
          { id: "expenditures", label: "Expenditures Ledger (Expenses)", icon: ArrowDownRight }
        ].map(t => {
          const Icon = t.icon;
          const active = activeSubTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveSubTab(t.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold uppercase tracking-wider text-[11px] transition cursor-pointer ${
                active 
                  ? "border-[#2D3E50] text-[#2D3E50]" 
                  : "border-transparent text-[#636E72] hover:text-[#2D3E50]"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-[#C5A059]" : "text-[#A0A0A0]"}`} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ERROR / LOADING */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center font-bold text-[#A0A0A0] text-sm animate-pulse">
          Retrieving financial data files from SQLite Storage...
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TAB 1: LEDGER */}
          {activeSubTab === "ledger" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Formula & balance cards */}
              <div className="p-6 bg-gradient-to-br from-[#2D3E50] to-[#1e2a36] text-white rounded-2xl shadow-md border border-[#1e2a36] relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10">
                  <DollarSign className="h-48 w-48 text-white stroke-[0.2]" />
                </div>
                
                <h3 className="font-display font-black uppercase tracking-widest text-[#C5A059] text-[10px] mb-3">
                  TREASURY LEDGER BALANCE SHEETS
                </h3>
                
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <span className="text-white/60 font-semibold uppercase tracking-wider text-[9px] block">Sum of Revenue Streams</span>
                    <span className="text-2xl font-black font-display text-emerald-400 mt-1 block">
                      {formatKES(totalRevenueSum)}
                    </span>
                  </div>

                  <div>
                    <span className="text-white/60 font-semibold uppercase tracking-wider text-[9px] block">Deducted Expenditures</span>
                    <span className="text-2xl font-black font-display text-rose-400 mt-1 block">
                      - {formatKES(totalExpenditureSum)}
                    </span>
                  </div>

                  <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                    <span className="text-[#C5A059] font-black uppercase tracking-wider text-[9px] block">Net Accounts Balance</span>
                    <span className={`text-2xl font-black font-display mt-1 block ${netChurchBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {formatKES(netChurchBalance)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/15 pt-4 text-[10px] text-neutral-300 font-medium leading-relaxed bg-black/10 -mx-6 -mb-6 px-6 py-3 flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#C5A059]">
                  <span>
                    <strong>Deduction Method Apply:</strong> Net Funds = (Tithes + Offerings + Annual Registrations + Monthly Contributions) - Summed Expenditures
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black uppercase tracking-widest text-[8px]">
                    Ledger Status: Balanced
                  </span>
                </div>
              </div>

              {/* Incomes stream break down cards */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D3E50] mb-3">
                  Revenues Earned by Specific Category Dues
                </h3>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Tithes", val: totalEarnedFromTithes, color: "text-[#2D3E50]" },
                    { label: "Sunday General Offerings", val: totalEarnedFromOfferings, color: "text-[#C5A059]" },
                    { label: "Annual Registrations", val: totalEarnedFromAnnualReg, color: "text-emerald-600" },
                    { label: "Monthly Contributions", val: totalEarnedFromMonthlyCont, color: "text-blue-600" }
                  ].map((stream, idx) => {
                    const pct = totalRevenueSum > 0 ? (stream.val / totalRevenueSum) * 100 : 0;
                    return (
                      <div key={idx} className="bg-white border border-[#E5E1D8] p-4 rounded-2xl flex flex-col justify-between shadow-xs">
                        <div>
                          <span className="font-bold text-[#A0A0A0] text-[10px] uppercase tracking-wider block">{stream.label}</span>
                          <span className={`text-lg font-black ${stream.color} mt-1.5 block`}>{formatKES(stream.val)}</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[9px] font-bold text-[#636E72] mb-1">
                            <span>Share Of Budget</span>
                            <span>{pct.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${idx === 0 ? "bg-[#2D3E50]" : idx === 1 ? "bg-[#C5A059]" : idx === 2 ? "bg-emerald-500" : "bg-blue-500"}`}
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Income vs Expenditure Charts analysis */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Chart 1: Income distribution */}
                <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#2D3E50] mb-4">
                    Income Streams Allocation
                  </h4>
                  {incomeDistribution.length === 0 ? (
                    <p className="text-xs text-[#A0A0A0] italic text-center py-20">No revenue data reported.</p>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={incomeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {incomeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colorsList[index % colorsList.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => formatKES(Number(value || 0))} />
                          <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Chart 2: Expenditure distribution */}
                <div className="bg-white border border-[#E5E1D8] p-5 rounded-2xl">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#2D3E50] mb-4">
                    Expenditures Category Share
                  </h4>
                  {expenditureDistribution.length === 0 ? (
                    <p className="text-xs text-[#A0A0A0] italic text-center py-20 hover:text-[#2D3E50]">No expenditure entries tracked in database.</p>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expenditureDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {expenditureDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colorsList[(index + 3) % colorsList.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => formatKES(Number(value || 0))} />
                          <Legend wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Consolidated transaction ledger feed */}
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-[#2D3E50]">
                    General Chronological Posting Log
                  </h3>
                  <div className="flex items-center gap-2 select-none">
                    <span className="text-[10px] font-bold text-[#636E72] normal-case bg-[#F5F2ED] px-3 py-1.5 rounded-lg border border-[#E5E1D8]">
                      {contributions.length + expenditures.length} database transaction lines
                    </span>
                    <button
                      onClick={handleExportLedger}
                      className="h-8 rounded-lg border border-[#E5E1D8] bg-white px-3 font-bold uppercase tracking-wider text-[10px] text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 transition flex items-center gap-1.5 cursor-pointer"
                      title="Export compiled journal ledger (CSV)"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                      Export Ledger CSV
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#E5E1D8] text-[10px] font-bold uppercase tracking-wider text-[#636E72] bg-[#FDFCF8] h-10">
                        <th className="px-3">Type</th>
                        <th className="px-3">Entry Name / Details</th>
                        <th className="px-3">Category / Fund</th>
                        <th className="px-3">Affiliation (Branch/Cell)</th>
                        <th className="px-3">Posting Date</th>
                        <th className="px-3">Clearance Mode</th>
                        <th className="px-3 text-right">Amount (KES)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium">
                      {[
                        ...contributions.map(c => ({
                          isIncome: true,
                          title: c.first_name ? `${c.first_name} ${c.last_name}` : "Anonymous Giver",
                          sub: c.notes || "No notes",
                          branch: c.branch_name || "Unknown",
                          cell: c.cell_group_name,
                          category: c.type,
                          date: c.date,
                          method: c.payment_method,
                          amount: c.amount,
                          id: `inc-${c.id}`
                        })),
                        ...expenditures.map(e => ({
                          isIncome: false,
                          title: e.title,
                          sub: e.description || e.branch_name || "General HQ Expenditure",
                          branch: e.branch_name || "HQ",
                          cell: null,
                          category: e.category,
                          date: e.date,
                          method: "Bank Account Debit",
                          amount: e.amount,
                          id: `exp-${e.id}`
                        }))
                      ]
                        .sort((a,b) => b.date.localeCompare(a.date))
                        .map(item => (
                          <tr key={item.id} className="h-12 hover:bg-[#FDFCF8]">
                            <td className="px-3">
                              {item.isIncome ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                  <ArrowUpRight className="h-2.5 w-2.5" />
                                  Income
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                  <ArrowDownRight className="h-2.5 w-2.5" />
                                  Expense
                                </span>
                              )}
                            </td>
                            <td className="px-3">
                              <span className="font-bold text-[#2D3E50] text-[11px] block">{item.title}</span>
                              <span className="text-[9px] text-[#A0A0A0] block mt-0.5 line-clamp-1">{item.sub}</span>
                            </td>
                            <td className="px-3">
                              <span className="font-semibold text-[#636E72]">{item.category}</span>
                            </td>
                            <td className="px-3">
                              <span className="text-[10px] font-bold text-[#2D3E50] block">{item.branch}</span>
                              {item.cell && (
                                <span className="text-[9px] text-emerald-600 block">{item.cell}</span>
                              )}
                            </td>
                            <td className="px-3 font-mono text-neutral-400">{item.date}</td>
                            <td className="px-3 text-[#A0A0A0] text-[10px]">{item.method}</td>
                            <td className={`px-3 text-right font-bold text-[11px] ${item.isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                              {item.isIncome ? "+" : "-"}{formatKES(item.amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: INCOMES */}
          {activeSubTab === "incomes" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Search + Filter controls */}
              <div className="bg-white border border-[#E5E1D8] p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
                <div className="relative flex-grow max-w-sm">
                  <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search contributors or keywords..."
                    value={incSearch}
                    onChange={(e) => setIncSearch(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[#E5E1D8] bg-[#FDFCF8] pl-9 pr-3 text-xs focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isAdmin && selectedIncomeIds.length > 0 && (
                    <button onClick={handleDeleteSelectedIncomes} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-600 transition cursor-pointer shadow-sm shadow-rose-500/15">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Selected ({selectedIncomeIds.length})</span>
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setShowIncomeImportModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D8] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 transition cursor-pointer"
                      title="Import contributions from CSV file"
                    >
                      <UploadCloud className="h-4 w-4 text-blue-600" />
                      <span>Import CSV</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#636E72]">Dues Type:</span>
                    <select
                      value={incType}
                      onChange={(e) => setIncType(e.target.value)}
                      className="h-8 rounded-lg bg-neutral-50 border border-neutral-200 px-2 text-[10px] font-semibold cursor-pointer text-neutral-600"
                    >
                      <option value="All">All Types</option>
                      <option value="Tithe">Tithe Payment</option>
                      <option value="Offering">Sunday Offering</option>
                      <option value="Annual Registration">Annual Registration Dues</option>
                      <option value="Monthly Contribution">Monthly Contribution</option>
                      <option value="Building Fund">Building Fund</option>
                      <option value="Special Donation">Special Donation</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#636E72]">Payment System:</span>
                    <select
                      value={incMethod}
                      onChange={(e) => setIncMethod(e.target.value)}
                      className="h-8 rounded-lg bg-neutral-50 border border-neutral-200 px-2 text-[10px] font-semibold cursor-pointer text-neutral-600"
                    >
                      <option value="All">All Systems</option>
                      <option value="Online">Online Gateway</option>
                      <option value="Cash">Cash Envelope</option>
                      <option value="Check">Manual Check</option>
                      <option value="Card">POS Card</option>
                      <option value="Bank Transfer">Wire Transfer</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#636E72]">Month:</span>
                    <select
                      value={incMonth}
                      onChange={(e) => setIncMonth(e.target.value)}
                      className="h-8 rounded-lg bg-neutral-50 border border-neutral-200 px-2 text-[10px] font-semibold cursor-pointer text-neutral-600"
                    >
                      <option value="All">All Months</option>
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#636E72]">Year:</span>
                    <select
                      value={incYear}
                      onChange={(e) => setIncYear(e.target.value)}
                      className="h-8 rounded-lg bg-neutral-50 border border-neutral-200 px-2 text-[10px] font-semibold cursor-pointer text-neutral-600"
                    >
                      <option value="All">All Years</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#636E72]">Cell Group:</span>
                    <select
                      value={incCellGroup}
                      onChange={(e) => setIncCellGroup(e.target.value)}
                      className="h-8 rounded-lg bg-neutral-50 border border-neutral-200 px-2 text-[10px] font-semibold cursor-pointer text-neutral-600"
                    >
                      <option value="All">All Cell Groups</option>
                      {cellGroups.map(cg => (
                        <option key={cg.id} value={cg.id}>{cg.name}</option>
                      ))}
                    </select>
                  </div>










                  <button
                    onClick={handleExportIncomes}
                    disabled={filteredIncomes.length === 0}
                    className="h-8 rounded-lg border border-[#E5E1D8] bg-white px-3 font-bold uppercase tracking-wider text-[10px] text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
                    title="Export filtered contributions list to CSV"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Incomes table */}
              <div className="bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-xs">
                {filteredIncomes.length === 0 ? (
                  <div className="p-16 text-center italic text-[#A0A0A0]">
                    No income logs match the active parameters in SQLite database.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#E5E1D8] text-[9px] font-bold uppercase tracking-wider text-[#636E72] bg-[#FDFCF8] h-10">
                          {isAdmin && (
                            <th className="py-4 px-3">
                              <input
                                type="checkbox"
                                checked={selectAllIncomes}
                                onChange={handleSelectAllIncomes}
                                className="h-4 w-4 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]" />
                            </th>)}
                          <th className="px-4">Contributor Member</th>
                          <th className="px-4">Posted Group</th>
                          <th className="px-4">Clearing Mode</th>
                          <th className="px-4">Affiliation</th>
                          <th className="px-4">Clearance Date</th>
                          <th className="px-4">Description Memo</th>
                          <th className="px-4 text-right">Amount (KES)</th>
                          {/* Only show actions column if admin */}
                          <th className="px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-medium">
                        {filteredIncomes.map(item => (
                          <tr key={item.id} className="h-11 hover:bg-[#FDFCF8] text-[#2D3E50]">
                            <td className="px-4">
                              {isAdmin && (
                                <input
                                  type="checkbox"
                                  checked={selectedIncomeIds.includes(item.id)}
                                  onChange={() => toggleSelectIncome(item.id)}
                                  className="h-4 w-4 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059] mr-2"
                                />
                              )}
                              {item.first_name ? (
                                <div className="flex flex-col">
                                  <span className="font-bold">{item.first_name} {item.last_name}</span>
                                  {(item as any).registration_number && (
                                    <span className="text-[9px] font-black text-[#C5A059] uppercase tracking-tighter leading-none">{(item as any).registration_number}</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[#636E72] italic font-semibold bg-neutral-50 rounded px-2 py-0.5">Anonymous Giver</span>
                              )}
                            </td>
                            <td className="px-4">
                              <span className="bg-emerald-50 text-emerald-800 rounded px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                {item.type}
                              </span>
                            </td>
                            <td className="px-4 text-[10px] text-neutral-500">{item.payment_method}</td>
                            <td className="px-4">
                              <div className="text-[10px] font-bold">{item.branch_name || "—"}</div>
                              <div className="text-[9px] text-emerald-600">{item.cell_group_name || ""}</div>
                            </td>
                            <td className="px-4 font-mono text-neutral-400">{item.date}</td>
                            <td className="px-4 text-[11px] text-[#2D3436] max-w-[200px] truncate">{item.notes || "—"}</td>
                            <td className="px-4 text-right text-emerald-600 font-bold text-xs">{formatKES(item.amount)}</td>
                            <td className="px-4 text-center">
                              {isAdmin && (
                                <button
                                  onClick={() => setDeletingIncomeId(item.id)}
                                  className="h-7 w-7 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg flex items-center justify-center mx-auto transition cursor-pointer"
                                  title="Void Entry"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: EXPENDITURES */}
          {activeSubTab === "expenditures" && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6"
            >
              {/* Search + Filter expenses */}
              <div className="bg-white border border-[#E5E1D8] p-4 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
                <div className="relative flex-grow max-w-sm">
                  <span className="absolute inset-y-0 left-3 flex items-center text-neutral-400">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search expenditure items..."
                    value={expSearch}
                    onChange={(e) => setExpSearch(e.target.value)}
                    className="w-full h-9 rounded-xl border border-[#E5E1D8] bg-[#FDFCF8] pl-9 pr-3 text-xs focus:outline-none focus:border-[#C5A059] focus:bg-white transition"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {isAdmin && selectedExpenseIds.length > 0 && (
                    <button onClick={handleDeleteSelectedExpenses} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-rose-600 transition cursor-pointer shadow-sm shadow-rose-500/15">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Selected ({selectedExpenseIds.length})</span>
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => setShowExpenseImportModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E1D8] bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 transition cursor-pointer"
                      title="Import expenditures from CSV file"
                    >
                      <UploadCloud className="h-4 w-4 text-blue-600" />
                      <span>Import CSV</span>
                    </button>
                  )}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#636E72]">Category:</span>
                    <select
                      value={expCat}
                      onChange={(e) => setExpCat(e.target.value)}
                      className="h-8 rounded-lg bg-neutral-50 border border-neutral-200 px-2 text-[10px] font-semibold cursor-pointer text-neutral-600"
                    >
                      <option value="All">All Categories</option>
                      <option value="Utilities & Audio">Utilities & Audio</option>
                      <option value="Missions & Charity">Missions & Charity</option>
                      <option value="Rent & Logistics">Rent & Logistics</option>
                      <option value="Salaries & Stipends">Salaries & Stipends</option>
                      <option value="Office & Stationery">Office & Stationery</option>
                      <option value="Events & Outreaches">Events & Outreaches</option>
                      <option value="Repairs & Upkeep">Repairs & Upkeep</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#636E72]">Branch Link:</span>
                    <select
                      value={expBranch}
                      onChange={(e) => setExpBranch(e.target.value)}
                      className="h-8 rounded-lg bg-neutral-50 border border-neutral-200 px-2 text-[10px] font-semibold cursor-pointer text-neutral-600"
                    >
                      <option value="All">All Branches</option>
                      <option value="HQ">Ramba HQ Only</option>
                      {branches.filter(b => b.id !== 1).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleExportExpenditures}
                    disabled={filteredExpenses.length === 0}
                    className="h-8 rounded-lg border border-[#E5E1D8] bg-white px-3 font-bold uppercase tracking-wider text-[10px] text-[#636E72] hover:bg-neutral-50 hover:text-neutral-900 disabled:opacity-50 transition flex items-center gap-1.5 cursor-pointer"
                    title="Export filtered expenditures list to CSV"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Expense registers tables */}
              <div className="bg-white border border-[#E5E1D8] rounded-2xl overflow-hidden shadow-xs">
                {filteredExpenses.length === 0 ? (
                  <div className="p-16 text-center italic text-[#A0A0A0]">
                    No church expenditure entries match search parameters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#E5E1D8] text-[9px] font-bold uppercase tracking-wider text-[#636E72] bg-[#FDFCF8] h-10">
                          {isAdmin && (
                            <th className="py-4 px-3">
                              <input
                                type="checkbox"
                                checked={selectAllExpenses}
                                onChange={handleSelectAllExpenses}
                                className="h-4 w-4 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059]" />
                            </th>)}
                          <th className="px-4">Expenditure Account Details</th>
                          <th className="px-4">Allocated Category</th>
                          <th className="px-4">Posting Date</th>
                          <th className="px-4">Responsible Branch</th>
                          <th className="px-4">Additional Details</th>
                          <th className="px-4 text-right">Amount (KES)</th>
                          {/* Only show actions column if admin */}
                          <th className="px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-medium">
                        {filteredExpenses.map(item => (
                          <tr key={item.id} className="h-11 hover:bg-[#FDFCF8] text-[#2D3E50]">
                            <td className="px-4">
                              {isAdmin && (
                                <input
                                  type="checkbox"
                                  checked={selectedExpenseIds.includes(item.id)}
                                  onChange={() => toggleSelectExpense(item.id)}
                                  className="h-4 w-4 rounded border-gray-300 text-[#C5A059] focus:ring-[#C5A059] mr-2"
                                />
                              )}
                              <span className="font-bold text-[11px] block">{item.title}</span>
                            </td>
                            <td className="px-4">
                              <span className="bg-amber-100/70 border border-amber-200 text-amber-900 rounded px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-4 font-mono text-neutral-400">{item.date}</td>
                            <td className="px-4 font-sans text-neutral-600 font-bold">{item.branch_name || "Headquarters HQ"}</td>
                            <td className="px-4 text-[11px] text-[#2D3436] max-w-[200px] truncate">{item.description || "—"}</td>
                            <td className="px-4 text-right text-rose-600 font-bold">{formatKES(item.amount)}</td>
                            <td className="px-4 text-center">
                              {isAdmin && (
                                <button
                                  onClick={() => setDeletingExpenseId(item.id)}
                                  className="h-7 w-7 text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg flex items-center justify-center mx-auto transition cursor-pointer"
                                  title="Void Expense Item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* INCOME RECORDING MODAL */}
      <AnimatePresence>
        {showIncomeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/45 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-150 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3 mb-4">
                <span className="font-display font-black text-sm uppercase tracking-wider text-[#2D3E50]">Record New Revenue Transaction</span>
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleIncomeSubmit} className="space-y-4 font-sans font-semibold text-xs">
                {/* Anonymous switch */}
                <div className="flex items-center justify-between bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-neutral-200">
                  <div>
                    <label className="block font-bold text-[#2D3E50] text-[11px]">Record as Anonymous</label>
                    <span className="text-[9px] text-[#A0A0A0] block font-normal">Check if contributor member is anonymous or offline guest box</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={incIsAnonymous}
                    onChange={(e) => {
                      setIncIsAnonymous(e.target.checked);
                      if (e.target.checked) setIncMemberId("");
                    }}
                    className="h-4 w-4 text-[#C5A059] focus:ring-[#C5A059] border-gray-300 rounded cursor-pointer"
                  />
                </div>

                {/* Member Search & Selector */}
                {!incIsAnonymous && (
                  <div className="relative">
                    <label className="block font-bold text-[#636E72] mb-1">Search & Select Contributor Member *</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={memberSearchTerm}
                        onFocus={() => setShowMemberResults(true)}
                        onChange={(e) => {
                          setMemberSearchTerm(e.target.value);
                          setShowMemberResults(true);
                        }}
                        className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 pl-9 pr-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold transition text-[#2D3E50]"
                      />
                    </div>
                    
                    {/* Selected Member Indicator */}
                    {incMemberId && !showMemberResults && (
                      <div className="mt-2 p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800">
                          Selected: {members.find(m => m.id.toString() === incMemberId)?.first_name} {members.find(m => m.id.toString() === incMemberId)?.last_name}
                        </span>
                        <button type="button" onClick={() => {setIncMemberId(""); setMemberSearchTerm("");}} className="text-emerald-600 hover:text-emerald-800 cursor-pointer"><X className="h-3 w-3"/></button>
                      </div>
                    )}

                    {/* Results Dropdown */}
                    <AnimatePresence>
                      {showMemberResults && memberSearchTerm.length > 0 && (
                        <>
                          <div className="fixed inset-0 z-[55]" onClick={() => setShowMemberResults(false)} />
                          <motion.div 
                            initial={{ opacity: 0, y: -5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute z-[60] mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-neutral-50"
                          >
                            {searchedMembers.length === 0 ? (
                              <div className="p-4 text-center text-neutral-400 italic">No members found.</div>
                            ) : (
                              searchedMembers.map(m => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    setIncMemberId(m.id.toString());
                                    setIncBranchId(m.branch_id?.toString() || "");
                                    setIncCellGroupId(m.cell_group_id?.toString() || "");
                                    setMemberSearchTerm(`${m.first_name} ${m.last_name}`);
                                    setShowMemberResults(false);
                                  }}
                                  className="w-full text-left p-3 hover:bg-neutral-50 flex items-center justify-between transition group cursor-pointer"
                                >
                                  <div>
                                    <div className="font-bold text-[#2D3E50]">{m.first_name} {m.last_name}</div>
                                    <div className="text-[10px] text-neutral-500">
                                      {(m as any).registration_number && <span className="text-[#C5A059] font-bold mr-1">[{(m as any).registration_number}]</span>}
                                      {m.branch_name || "No Branch"} • {m.phone || "No Phone"}
                                    </div>
                                  </div>
                                  <div className="text-[9px] font-bold text-[#C5A059] uppercase opacity-0 group-hover:opacity-100 transition">Select</div>
                                </button>
                              ))
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Branch and Cell Group Affiliation */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Affiliated Branch</label>
                    <select
                      value={incBranchId}
                      onChange={(e) => setIncBranchId(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 px-2.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold cursor-pointer transition text-[#2D3E50]"
                    >
                      <option value="">-- Select Branch --</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Affiliated Cell Group</label>
                    <select
                      value={incCellGroupId}
                      onChange={(e) => setIncCellGroupId(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 px-2.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold cursor-pointer transition text-[#2D3E50]"
                    >
                      <option value="">-- Select Cell Group --</option>
                      {cellGroups.map(cg => <option key={cg.id} value={cg.id}>{cg.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Amount and Type */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Amount (KES) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="1"
                      placeholder="e.g. 150.00"
                      value={incAmount}
                      onChange={(e) => setIncAmount(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Revenue Channel *</label>
                    <select
                      value={incTypeVal}
                      onChange={(e) => setIncTypeVal(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-[10px] font-bold uppercase tracking-wider cursor-pointer transition text-[#636E72]"
                    >
                      <option value="Tithe">Tithe Payment</option>
                      <option value="Offering">Sunday Offering</option>
                      <option value="Annual Registration">Annual Registration Dues</option>
                      <option value="Monthly Contribution">Monthly Contribution</option>
                      <option value="Building Fund">Building Fund</option>
                      <option value="Special Donation">Special Donation</option>
                    </select>
                  </div>
                </div>

                {/* Clearing method and Date */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Date Cleared *</label>
                    <input
                      type="date"
                      required
                      value={incDate}
                      onChange={(e) => setIncDate(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Clearance Type *</label>
                    <select
                      value={incPaymentMethod}
                      onChange={(e) => setIncPaymentMethod(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs cursor-pointer transition text-[#2D3E50]"
                    >
                      <option value="Online">Online Gateway Link</option>
                      <option value="Cash">Physical Cash Envelope</option>
                      <option value="Check">Physical Manual Check</option>
                      <option value="Card">Terminal POS Swipe</option>
                      <option value="Bank Transfer">Direct Wire Transfer</option>
                    </select>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Posting Memo (Optional)</label>
                  <textarea
                    rows={2}
                    value={incNotes}
                    onChange={(e) => setIncNotes(e.target.value)}
                    placeholder="Provide cheque numbers, donor intention notes, or allocation limits..."
                    className="w-full rounded-xl bg-neutral-50 border border-neutral-300/85 p-3 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition resize-none font-medium text-[#2D3436]"
                  />
                </div>

                {/* Form Controls */}
                <div className="flex gap-2 justify-end border-t border-[#E5E1D8] pt-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowIncomeModal(false)}
                    className="h-10 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F5F2ED] px-4 font-bold uppercase tracking-wider text-[#2D3E50]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-[#2D3E50] text-[#C5A059] hover:bg-[#1e2a36] px-5 font-bold uppercase tracking-wider shadow-sm"
                  >
                    Post Income
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPENDITURE FILING MODAL */}
      <AnimatePresence>
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/45 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-150 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3 mb-4">
                <span className="font-display font-black text-sm uppercase tracking-wider text-amber-800 flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  File Church Expenditure Account
                </span>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleExpenseSubmit} className="space-y-4 font-sans font-semibold text-xs">
                {/* Title */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Expenditure Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. sanctuary electric utility settlement"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                  />
                </div>

                {/* Amount & Category */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Sum in KES *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="1"
                      placeholder="e.g. 450.00"
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Expenditure Category *</label>
                    <select
                      value={expCatVal}
                      onChange={(e) => setExpCatVal(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 px-2 focus:outline-none focus:border-[#C5A059] focus:bg-white text-[10px] font-bold uppercase tracking-wider cursor-pointer transition text-[#636E72]"
                    >
                      <option value="Utilities & Audio">Utilities & Audio</option>
                      <option value="Missions & Charity">Missions & Charity</option>
                      <option value="Rent & Logistics">Rent & Logistics</option>
                      <option value="Salaries & Stipends">Salaries & Stipends</option>
                      <option value="Office & Stationery">Office & Stationery</option>
                      <option value="Events & Outreaches">Events & Outreaches</option>
                      <option value="Repairs & Upkeep">Repairs & Upkeep</option>
                    </select>
                  </div>
                </div>

                {/* Date & Branch */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Filing Date *</label>
                    <input
                      type="date"
                      required
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      className="w-full h-10 rounded-xl bg-[#FDFCF8] border border-[#E5E1D8] px-3.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-semibold transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#636E72] mb-1">Debited Branch Link</label>
                    <select
                      value={expBranchId}
                      onChange={(e) => setExpBranchId(e.target.value)}
                      className="w-full h-10 rounded-xl bg-neutral-50 border border-neutral-300/85 px-2.5 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs font-bold uppercase tracking-wider text-[#636E72] cursor-pointer transition"
                    >
                      <option value="">Ramba HQ Headquarters</option>
                      {branches.filter(b => b.id !== 1).map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description info */}
                <div>
                  <label className="block font-bold text-[#636E72] mb-1">Brief Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    placeholder="Receipt details, approvals by Bishop, or local dealer invoice serials"
                    className="w-full rounded-xl bg-neutral-50 border border-neutral-300/85 p-3 focus:outline-none focus:border-[#C5A059] focus:bg-white text-xs transition resize-none font-medium text-[#2D3436]"
                  />
                </div>

                {/* Controls */}
                <div className="flex gap-2 justify-end border-t border-[#E5E1D8] pt-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="h-10 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F5F2ED] px-4 font-bold uppercase tracking-wider text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-10 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-5 font-bold uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    Debit Expense Entry
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INCOME VOID CONFIRM */}
      <AnimatePresence>
        {deletingIncomeId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-neutral-150 text-center text-xs"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 border border-rose-100 mb-4 text-rose-500">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900 font-sans">Void transaction entry?</h3>
              <p className="mt-2 text-neutral-500 leading-relaxed font-semibold">
                Voiding this posting will remove the funds from the registered balances on the database. This accounting action cannot be undone.
              </p>
              <div className="mt-5 flex gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => setDeletingIncomeId(null)}
                  className="px-4 py-2 hover:bg-[#FDFCF8] border border-neutral-200 text-neutral-600 rounded-lg font-bold transition cursor-pointer font-sans"
                >
                  Keep Entry
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = deletingIncomeId;
                    if (id !== null) {
                      handleDeleteIncome(id);
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-black transition cursor-pointer font-sans"
                >
                  Void Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXPENSE VOID CONFIRM */}
      <AnimatePresence>
        {deletingExpenseId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-neutral-155 text-center text-xs"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-100 mb-4 text-amber-600">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-neutral-900 font-sans font-black uppercase">Void Church Expenditure?</h3>
              <p className="mt-2 text-neutral-500 leading-relaxed font-semibold">
                Voiding this item will reinstate the deducted amount back into the net balance calculations of the treasury database.
              </p>
              <div className="mt-5 flex gap-2.5 justify-center font-sans font-bold">
                <button
                  type="button"
                  onClick={() => setDeletingExpenseId(null)}
                  className="px-4 py-2 hover:bg-[#FDFCF8] border border-neutral-200 text-neutral-600 rounded-lg transition cursor-pointer"
                >
                  Keep Expense Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = deletingExpenseId;
                    if (id !== null) {
                      handleDeleteExpense(id);
                    }
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition cursor-pointer"
                >
                  Yes, Void Expense
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
