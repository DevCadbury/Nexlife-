"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function ApiDocs() {
  return (
    <div className="space-y-6">
      <Card className="bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800">
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Endpoints, authentication, and examples
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-slate dark:prose-invert max-w-none">
          <h3 className="text-slate-900 dark:text-slate-100">Authentication</h3>
          <pre className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-4 text-xs overflow-auto text-slate-900 dark:text-slate-100">
            <code>{`POST /api/auth/login
Body: { email, password }
Response: { token, user }`}</code>
          </pre>

          <h3 className="text-slate-900 dark:text-slate-100">Current User</h3>
          <pre className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-4 text-xs overflow-auto text-slate-900 dark:text-slate-100">
            <code>{`GET /api/auth/me
Headers: { Authorization: Bearer <token> } or cookie nxl_jwt
Response: { user: { id, email, name, role } }`}</code>
          </pre>

          <h3 className="text-slate-900 dark:text-slate-100">Inquiries</h3>
          <pre className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-4 text-xs overflow-auto text-slate-900 dark:text-slate-100">
            <code>{`GET /api/inquiries?status=new&limit=20
PATCH /api/inquiries/:id/mark-read
PATCH /api/inquiries/threads/mark-read-all { email }`}</code>
          </pre>

          <h3 className="text-slate-900 dark:text-slate-100">Analytics</h3>
          <pre className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-4 text-xs overflow-auto text-slate-900 dark:text-slate-100">
            <code>{`GET /api/analytics/overview
GET /api/analytics/submissions?range=7|30|90
GET /api/analytics/status
GET /api/analytics/visitors/countries?range=30`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
