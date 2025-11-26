'use client';

import { useState } from 'react';
import { useCRMStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

export default function ImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const importData = useCRMStore((state) => state.importData);

  // Parse Excel file
  const parseExcel = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) {
            reject(new Error('Failed to read file'));
            return;
          }

          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Transform Excel data to expected format
          const transformedData = transformExcelData(jsonData);
          resolve(transformedData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // Transform Excel data to CRM format
  const transformExcelData = (data: any[]) => {
    const transformed = {
      companies: [] as any[],
      contacts: [] as any[],
      opportunities: [] as any[]
    };

    data.forEach((row) => {
      // Check for company data
      if (row['Company Name'] || row['company_name']) {
        transformed.companies.push({
          name: row['Company Name'] || row.company_name,
          industry: row['Industry'] || row.industry,
          website: row['Website'] || row.website,
          phone: row['Company Phone'] || row.company_phone || row.phone,
          city: row['City'] || row.city,
          country: row['Country'] || row.country,
        });
      }

      // Check for contact data
      if ((row['First Name'] || row['first_name']) && (row['Last Name'] || row['last_name'])) {
        transformed.contacts.push({
          first_name: row['First Name'] || row.first_name,
          last_name: row['Last Name'] || row.last_name,
          email: row['Email'] || row.email,
          phone: row['Phone'] || row.phone,
          position: row['Position'] || row.position,
          company_id: undefined, // Will be linked later
        });
      }

      // Check for opportunity data
      if (row['Opportunity Title'] || row['opportunity_title']) {
        transformed.opportunities.push({
          title: row['Opportunity Title'] || row.opportunity_title,
          amount: parseFloat(row['Amount'] || row.amount) || 0,
          forecast_amount: parseFloat(row['Forecast Amount'] || row.forecast_amount) || 0,
          status: (row['Status'] || row.status || 'lead').toLowerCase(),
          sector: row['Sector'] || row.sector,
          priority: (row['Priority'] || row.priority || 'medium').toLowerCase(),
          probability: parseInt(row['Probability'] || row.probability) || 50,
          close_date: row['Close Date'] || row.close_date,
          owner: row['Owner'] || row.owner,
          description: row['Description'] || row.description,
        });
      }
    });

    return transformed;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      let data;

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await parseExcel(file);
      } else if (file.name.endsWith('.json')) {
        const text = await file.text();
        data = JSON.parse(text);
      } else {
        throw new Error('Unsupported file format. Please upload Excel (.xlsx, .xls) or JSON files.');
      }

      await importData(data);
      setResult({
        success: true,
        message: 'Data imported successfully!',
        details: {
          companies: data.companies?.length || 0,
          contacts: data.contacts?.length || 0,
          opportunities: data.opportunities?.length || 0
        }
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setImporting(false);
    }
  };

  // Download sample Excel template
  const downloadSampleExcel = () => {
    const sampleData = [
      {
        'First Name': 'John',
        'Last Name': 'Doe',
        'Email': 'john.doe@example.com',
        'Phone': '+1-555-0123',
        'Position': 'Software Engineer',
        'Company Name': 'TechCorp Solutions',
        'Industry': 'Technology',
        'Website': 'https://techcorp.com',
        'Company Phone': '+1-555-0100',
        'City': 'San Francisco',
        'Country': 'USA'
      },
      {
        'First Name': 'Jane',
        'Last Name': 'Smith',
        'Email': 'jane.smith@example.com',
        'Phone': '+1-555-0124',
        'Position': 'Product Manager',
        'Company Name': 'Green Energy Inc',
        'Industry': 'Energy',
        'Website': 'https://greenenergy.com',
        'Company Phone': '+1-555-0101',
        'City': 'Austin',
        'Country': 'USA'
      },
      {
        'Opportunity Title': 'Enterprise Software License',
        'Amount': 150000,
        'Forecast Amount': 150000,
        'Status': 'qualified',
        'Sector': 'Technology',
        'Priority': 'high',
        'Probability': 75,
        'Close Date': '2025-02-15',
        'Owner': 'Sales Team',
        'Description': 'Large enterprise software deployment'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CRM Data');
    XLSX.writeFile(wb, 'crm-import-template.xlsx');
  };

  // Download sample JSON
  const downloadSampleJSON = () => {
    const json = {
      companies: [
        {
          name: 'TechCorp Solutions',
          industry: 'Technology',
          website: 'https://techcorp.com',
          phone: '+1-555-0100',
          city: 'San Francisco',
          country: 'USA',
        },
      ],
      contacts: [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1-555-0123',
          position: 'Software Engineer',
        },
      ],
      opportunities: [
        {
          title: 'Enterprise Software License',
          amount: 150000,
          forecast_amount: 150000,
          status: 'qualified',
          sector: 'Technology',
          priority: 'high',
          probability: 75,
          owner: 'Sales Team',
        },
      ],
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crm-import-template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Import Data</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Upload Excel or JSON files to import contacts, companies, and opportunities
        </p>
      </div>

      {/* Primary Import Card - Excel */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Excel Import (Recommended)
          </CardTitle>
          <CardDescription className="text-sm">
            Upload Excel files with your CRM data for the best import experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={downloadSampleExcel} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Download Excel Template</span>
            <span className="sm:hidden">Excel Template</span>
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={importing}
              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              id="excel-upload"
            />
          </div>
          
          {/* Excel Format Guide */}
          <div className="bg-muted/50 p-3 rounded-lg text-xs">
            <h4 className="font-medium mb-2">Excel Column Headers:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <strong>Contacts:</strong> First Name, Last Name, Email, Phone, Position, Company Name
              </div>
              <div>
                <strong>Companies:</strong> Company Name, Industry, Website, Company Phone, City, Country
              </div>
              <div className="sm:col-span-2">
                <strong>Opportunities:</strong> Opportunity Title, Amount, Status, Priority, Sector, Close Date
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Import Card - JSON */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
            JSON Import (Advanced)
          </CardTitle>
          <CardDescription className="text-sm">
            Upload structured JSON files for programmatic imports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={downloadSampleJSON} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Download JSON Template</span>
            <span className="sm:hidden">JSON Template</span>
          </Button>
          <div className="relative">
            <Input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={importing}
              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
              id="json-upload"
            />
          </div>
        </CardContent>
      </Card>

      {/* Import Status */}
      {importing && (
        <Alert>
          <AlertCircle className="h-4 w-4 animate-spin" />
          <AlertDescription>Processing your file... This may take a moment for large datasets.</AlertDescription>
        </Alert>
      )}

      {/* Result Alert */}
      {result && (
        <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertCircle className={`h-4 w-4 ${result.success ? 'text-green-600' : 'text-red-600'}`} />
          <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
            <div className="font-medium">{result.message}</div>
            {result.details && (
              <div className="mt-2 text-sm">
                <div>Companies: {result.details.companies}</div>
                <div>Contacts: {result.details.contacts}</div>
                <div>Opportunities: {result.details.opportunities}</div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Import Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Import Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Excel Format (Recommended)
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground">
              <li>Use the provided Excel template for best results</li>
              <li>All data can be in one sheet or separate sheets</li>
              <li>Column headers should match the template exactly</li>
              <li>Required fields: First Name, Last Name for contacts; Company Name for companies</li>
              <li>Status values: lead, qualified, proposal, negotiation, won, lost</li>
              <li>Priority values: low, medium, high</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">JSON Format</h3>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-muted-foreground">
              <li>Root object should contain companies, contacts, and/or opportunities arrays</li>
              <li>Each array item should be an object with appropriate fields</li>
              <li>Download the sample JSON to see the exact structure</li>
            </ul>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 text-sm">💡 Pro Tip</h4>
            <p className="text-blue-700 text-xs mt-1">
              Excel import automatically links contacts to companies by name and provides real-time updates across all users.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return <input className={className} {...props} />;
}
