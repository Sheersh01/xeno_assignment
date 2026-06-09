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
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-[#222]">
        <div>
          <h1 className="text-xl font-medium tracking-tight">Campaigns</h1>
          <p className="text-sm text-[#A0A0A0] mt-1">Manage and track all your outbound campaigns.</p>
        </div>
        <Link href="/campaigns/new">
          <Button>
            <Plus className="w-3.5 h-3.5 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="rounded-md border border-[#222] bg-[#0A0A0A] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#222] bg-[#0A0A0A] hover:bg-[#0A0A0A]">
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
                <TableCell className="font-medium text-[13px]">
                  <Link href={`/campaigns/${camp.id}`} className="hover:underline underline-offset-4 transition-colors">
                    {camp.name}
                  </Link>
                </TableCell>
                <TableCell className="text-[#A0A0A0] text-[13px]">{camp.segment?.name || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge variant="outline">{camp.channel}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={camp.status === 'RUNNING' ? 'success' : camp.status === 'DRAFT' ? 'warning' : 'default'}>
                    {camp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#A0A0A0] text-[13px]">
                  {format(new Date(camp.createdAt), 'MMM d, yyyy')}
                </TableCell>
              </TableRow>
            ))}
            {campaigns.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-[#555] py-12 text-[13px]">
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
