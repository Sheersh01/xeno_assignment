"use client";

import { useEffect, useState } from "react";
import { getCampaigns } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="text-sm text-[#A1A8B3]">Manage and track all your outbound campaigns.</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border border-[#1E2329] bg-[#111417]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Target Segment</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map(camp => (
              <TableRow key={camp.id}>
                <TableCell className="font-medium">
                  <Link href={`/campaigns/${camp.id}`} className="hover:underline hover:text-[#8B5CF6] transition-colors">
                    {camp.name}
                  </Link>
                </TableCell>
                <TableCell className="text-[#A1A8B3]">{camp.segment?.name || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{camp.channel}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={camp.status === 'RUNNING' ? 'success' : camp.status === 'DRAFT' ? 'warning' : 'default'}>
                    {camp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#A1A8B3]">
                  {format(new Date(camp.createdAt), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[#A1A8B3] py-8">
                  No campaigns found. Create your first one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
