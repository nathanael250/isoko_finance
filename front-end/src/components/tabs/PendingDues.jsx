import {React, useState} from 'react'

const PendingDues = () => {

    const [proRataDate, setProRataDate] = useState('09/07/2025');

    const loanTermsData = [
        {
            label: 'Total Due',
            type: 'due',
            principal: '100 000 000,00',
            interest: '2 000 000,00',
            fees: '0',
            penalty: '0',
            total: '102 000 000,00'
        },
        {
            label: 'Total Paid',
            type: 'paid',
            principal: '0',
            interest: '0',
            fees: '0',
            penalty: '0',
            total: '0'
        },
        {
            label: 'Balance',
            type: 'balance',
            principal: '100 000 000,00',
            interest: '2 000 000,00',
            fees: '0',
            penalty: '0',
            total: '102 000 000,00'
        }
    ];

    const loanScheduleData = [
        {
            label: 'Due till 28/07/2025',
            type: 'due',
            principal: '100 000 000,00',
            interest: '2 000 000,00',
            fees: '0',
            penalty: '0',
            total: '102 000 000,00'
        },
        {
            label: 'Paid till 28/07/2025',
            type: 'paid',
            principal: '0',
            interest: '0',
            fees: '0',
            penalty: '0',
            total: '0'
        },
        {
            label: 'Balance till 28/07/2025',
            type: 'balance',
            principal: '100 000 000,00',
            interest: '2 000 000,00',
            fees: '0',
            penalty: '0',
            total: '102 000 000,00'
        }
    ];

    const proRataData = [
        {
            label: 'Due till 09/07/2025',
            type: 'due',
            principal: '36 666 666,67',
            interest: '733 333,33',
            fees: '0',
            penalty: '0',
            total: '37 400 000,00'
        },
        {
            label: 'Paid till 09/07/2025',
            type: 'paid',
            principal: '0',
            interest: '0',
            fees: '0',
            penalty: '0',
            total: '0'
        },
        {
            label: 'Balance till 09/07/2025',
            type: 'balance',
            principal: '36 666 666,67',
            interest: '733 333,33',
            fees: '0',
            penalty: '0',
            total: '37 400 000,00'
        }
    ];

    const getRowClass = (type) => {
        switch (type) {
            case 'due':
                return 'bg-red-500 text-white';
            case 'paid':
                return 'bg-green-500 text-white';
            case 'balance':
                return 'bg-gray-400 text-white';
            default:
                return 'bg-gray-100';
        }
    };

    const TableRow = ({ item }) => (
        <tr className={getRowClass(item.type)}>
            <td className="px-4 py-2 text-sm font-medium w-48">{item.label}</td>
            <td className="px-4 py-2 text-sm text-right">{item.principal}</td>
            <td className="px-4 py-2 text-sm text-right">{item.interest}</td>
            <td className="px-4 py-2 text-sm text-right">{item.fees}</td>
            <td className="px-4 py-2 text-sm text-right">{item.penalty}</td>
            <td className="px-4 py-2 text-sm text-right font-medium">{item.total}</td>
        </tr>
    );

    const handleGoClick = () => {
        // Handle the Go button click - would typically recalculate pro-rata data
        console.log('Calculating pro-rata for date:', proRataDate);
    };
    return (
        <div>
            <div className="bg-white p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600">
                        Here you can see the pending due amounts for all-time, until today, and pro-rata basis.
                    </p>
                </div>

                {/* Based on Loan Terms */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Based on Loan Terms:</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700 w-48"></th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Principal</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Interest</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Fees</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Penalty</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loanTermsData.map((item, index) => (
                                    <TableRow key={index} item={item} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Based on Loan Schedule */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Based on Loan Schedule:</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700 w-48"></th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Principal</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Interest</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Fees</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Penalty</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loanScheduleData.map((item, index) => (
                                    <TableRow key={index} item={item} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pro-Rata Basis */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">Pro-Rata Basis:</h3>

                    {/* Date Input */}
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="text"
                            value={proRataDate}
                            onChange={(e) => setProRataDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded text-sm w-32"
                            placeholder="dd/mm/yyyy"
                        />
                        <button
                            onClick={handleGoClick}
                            className="px-4 py-2 bg-cyan-500 text-white text-sm rounded hover:bg-cyan-600 transition-colors"
                        >
                            Go
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700 w-48"></th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Principal</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Interest</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Fees</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Penalty</th>
                                    <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proRataData.map((item, index) => (
                                    <TableRow key={index} item={item} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Early Settlement Button */}
                <div className="text-center">
                    <button className="px-6 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors">
                        Early Settlement
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PendingDues
