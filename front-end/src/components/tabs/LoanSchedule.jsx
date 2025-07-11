import React from 'react'
import { Info } from 'lucide-react';

const LoanSchedule = () => {

    const scheduleData = [
        {
            date: '09/07/2025',
            description: 'Today',
            principal: '',
            interest: '',
            fees: '',
            penalty: '',
            due: '',
            paid: '',
            pendingDue: '',
            totalDue: '',
            principalDue: '',
            principalBalance: '100 000 000,00'
        },
        {
            date: '28/07/2025',
            description: 'Maturity',
            principal: '100 000 000,00',
            interest: '2 000 000,00',
            fees: '0',
            penalty: '0',
            due: '102 000 000,00',
            paid: '102 000 000,00',
            pendingDue: '102 000 000,00',
            totalDue: '100 000 000,00',
            principalDue: '',
            principalBalance: '0'
        }
    ];

    const totalsData = [
        {
            label: 'Total Due',
            principal: '100 000 000,00',
            interest: '2 000 000,00',
            fees: '0',
            penalty: '0',
            due: '102 000 000,00',
            paid: '0',
            pendingDue: '102 000 000,00',
            totalDue: '',
            principalDue: '100 000 000,00',
            principalBalance: ''
        },
        {
            label: 'Total Paid',
            principal: '0',
            interest: '0',
            fees: '0',
            penalty: '0',
            due: '',
            paid: '',
            pendingDue: '',
            totalDue: '',
            principalDue: '',
            principalBalance: ''
        },
        {
            label: 'Total Pending Due',
            principal: '100 000 000,00',
            interest: '2 000 000,00',
            fees: '0',
            penalty: '0',
            due: '',
            paid: '',
            pendingDue: '',
            totalDue: '',
            principalDue: '',
            principalBalance: ''
        }
    ];

    const TableCell = ({ children, className = '' }) => (
        <td className={`px-3 py-2 text-sm border-r border-gray-200 ${className}`}>
            {children}
        </td>
    );

    const TableHeader = ({ children, className = '' }) => (
        <th className={`px-3 py-2 text-sm font-medium text-gray-700 border-r border-gray-200 bg-gray-50 ${className}`}>
            {children}
        </th>
    );
    return (
        <div>
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                    <thead>
                        <tr className="bg-gray-50">
                            <TableHeader className="text-left"># Date</TableHeader>
                            <TableHeader className="text-left">Description</TableHeader>
                            <TableHeader className="text-right">Principal</TableHeader>
                            <TableHeader className="text-right">Interest</TableHeader>
                            <TableHeader className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                    Fees
                                    <Info size={14} className="text-blue-500" />
                                </div>
                            </TableHeader>
                            <TableHeader className="text-right">Penalty</TableHeader>
                            <TableHeader className="text-right">Due</TableHeader>
                            <TableHeader className="text-right">Paid</TableHeader>
                            <TableHeader className="text-right">Pending Due</TableHeader>
                            <TableHeader className="text-right">Total Due</TableHeader>
                            <TableHeader className="text-right">Principal Due</TableHeader>
                            <TableHeader className="text-right border-r-0">Principal Balance</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {scheduleData.map((row, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <TableCell className="font-medium">{row.date}</TableCell>
                                <TableCell>{row.description}</TableCell>
                                <TableCell className="text-right">{row.principal}</TableCell>
                                <TableCell className="text-right">{row.interest}</TableCell>
                                <TableCell className="text-right">{row.fees}</TableCell>
                                <TableCell className="text-right">{row.penalty}</TableCell>
                                <TableCell className="text-right">{row.due}</TableCell>
                                <TableCell className="text-right">{row.paid}</TableCell>
                                <TableCell className="text-right">{row.pendingDue}</TableCell>
                                <TableCell className="text-right">{row.totalDue}</TableCell>
                                <TableCell className="text-right">{row.principalDue}</TableCell>
                                <TableCell className="text-right border-r-0">{row.principalBalance}</TableCell>
                            </tr>
                        ))}

                        {/* Total rows */}
                        {totalsData.map((row, index) => (
                            <tr key={`total-${index}`} className="border-b border-gray-200 bg-gray-50">
                                <TableCell className="font-medium"></TableCell>
                                <TableCell className="font-medium">{row.label}</TableCell>
                                <TableCell className="text-right font-medium">{row.principal}</TableCell>
                                <TableCell className="text-right font-medium">{row.interest}</TableCell>
                                <TableCell className="text-right font-medium">{row.fees}</TableCell>
                                <TableCell className="text-right font-medium">{row.penalty}</TableCell>
                                <TableCell className="text-right font-medium">{row.due}</TableCell>
                                <TableCell className="text-right font-medium">{row.paid}</TableCell>
                                <TableCell className="text-right font-medium">{row.pendingDue}</TableCell>
                                <TableCell className="text-right font-medium">{row.totalDue}</TableCell>
                                <TableCell className="text-right font-medium">{row.principalDue}</TableCell>
                                <TableCell className="text-right font-medium border-r-0">{row.principalBalance}</TableCell>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer Notes */}
            <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div>
                    <span className="font-medium">Principal Balance:</span> The above Principal Balance column is calculated as follows: Any collection date that is less than or equal to today's date, total principal is reduced by the principal payments only. Any collection date after today's date, the total principal is reduced by the total principal due until the collection date.
                </div>
                <div>
                    <span className="font-medium">Branch Holidays:</span> If you don't want schedule to be generated on holidays or Fridays/Saturdays/Sundays, visit{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                        Branch Holidays
                    </a>
                    .
                </div>
            </div>
        </div>
    )
}

export default LoanSchedule
