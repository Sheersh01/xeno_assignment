"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Skeleton, SkeletonTableRow } from "@/components/ui/Skeleton";
import { format } from "date-fns";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const searchCache = new Map<string, any[]>();

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    async function load() {
      if (searchCache.has(debouncedSearch)) {
        setCustomers(searchCache.get(debouncedSearch)!);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getCustomers(debouncedSearch);
        searchCache.set(debouncedSearch, data);
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [debouncedSearch]);

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="pb-4 border-b border-[#222]">
        <h1 className="text-xl font-medium tracking-tight">Customers</h1>
        <p className="text-sm text-[#A0A0A0] mt-1">Manage your entire audience directory.</p>
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search by name, email, or city..." 
          className="max-w-sm bg-[#000] border-[#222] focus-visible:ring-[#EDEDED]" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border border-[#222] bg-[#0A0A0A] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#222] bg-[#0A0A0A] hover:bg-[#0A0A0A]">
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Spend</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Last Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonTableRow key={i} cols={5} />
                ))
              : customers.map(c => (
              <TableRow key={c.id} onClick={() => setSelectedCustomer(c)} className="cursor-pointer">
                <TableCell className="font-medium text-[13px]">
                  <div>{c.name}</div>
                  <div className="text-[11px] text-[#A0A0A0] font-normal">{c.email}</div>
                </TableCell>
                <TableCell className="text-[13px]">{c.city || '—'}</TableCell>
                <TableCell className="text-[13px]">${Number(c.totalSpend).toFixed(2)}</TableCell>
                <TableCell className="text-[13px]">{c.orderCount}</TableCell>
                <TableCell className="text-[#A0A0A0] text-[13px]">
                  {c.lastOrderDate ? format(new Date(c.lastOrderDate), 'MMM d, yyyy') : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl bg-[#0A0A0A] border-[#222] text-[#EDEDED]">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.name}</DialogTitle>
            <DialogDescription className="text-[#A0A0A0]">{selectedCustomer?.email} • {selectedCustomer?.phone}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider font-semibold">Total Spend</span>
              <p className="font-medium text-sm">${Number(selectedCustomer?.totalSpend).toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider font-semibold">Order Count</span>
              <p className="font-medium text-sm">{selectedCustomer?.orderCount}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider font-semibold">Average Order Value</span>
              <p className="font-medium text-sm">${Number(selectedCustomer?.avgOrderValue).toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-[#A0A0A0] uppercase tracking-wider font-semibold">City</span>
              <p className="font-medium text-sm">{selectedCustomer?.city || '—'}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-[10px] font-semibold mb-2 border-b border-[#222] pb-2 uppercase tracking-wider text-[#A0A0A0]">Order History</h4>
            {selectedCustomer?.orders?.length > 0 ? (
              <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {selectedCustomer.orders.map((o: any) => (
                  <li key={o.id} className="text-[13px] flex justify-between">
                    <span>{o.category}</span>
                    <span className="text-[#A0A0A0]">${Number(o.amount).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[13px] text-[#555]">No orders found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
