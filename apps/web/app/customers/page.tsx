"use client";

import { useEffect, useState } from "react";
import { getCustomers } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { format } from "date-fns";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-[#A1A8B3]">Manage your entire audience directory.</p>
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search by name, email, or city..." 
          className="max-w-sm" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-[#1E2329] bg-[#111417]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Total Spend</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Last Order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(c => (
              <TableRow key={c.id} onClick={() => setSelectedCustomer(c)}>
                <TableCell className="font-medium">
                  <div>{c.name}</div>
                  <div className="text-xs text-[#A1A8B3] font-normal">{c.email}</div>
                </TableCell>
                <TableCell>{c.city || '—'}</TableCell>
                <TableCell>${Number(c.totalSpend).toFixed(2)}</TableCell>
                <TableCell>{c.orderCount}</TableCell>
                <TableCell className="text-[#A1A8B3]">
                  {c.lastOrderDate ? format(new Date(c.lastOrderDate), 'MMM d, yyyy') : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.name}</DialogTitle>
            <DialogDescription>{selectedCustomer?.email} • {selectedCustomer?.phone}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-1">
              <span className="text-sm text-[#A1A8B3]">Total Spend</span>
              <p className="font-medium">${Number(selectedCustomer?.totalSpend).toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-[#A1A8B3]">Order Count</span>
              <p className="font-medium">{selectedCustomer?.orderCount}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-[#A1A8B3]">Average Order Value</span>
              <p className="font-medium">${Number(selectedCustomer?.avgOrderValue).toFixed(2)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-[#A1A8B3]">City</span>
              <p className="font-medium">{selectedCustomer?.city || '—'}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2 border-b border-[#1E2329] pb-2">Order History</h4>
            {selectedCustomer?.orders?.length > 0 ? (
              <ul className="space-y-2 max-h-32 overflow-y-auto">
                {selectedCustomer.orders.map((o: any) => (
                  <li key={o.id} className="text-sm flex justify-between">
                    <span>{o.category}</span>
                    <span className="text-[#A1A8B3]">${Number(o.amount).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#A1A8B3]">No orders found.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
