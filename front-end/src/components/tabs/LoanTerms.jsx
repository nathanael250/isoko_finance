import React from 'react'

const LoanTerms = () => {

    const actionButtons = [
        { label: 'Loan Statement', variant: 'primary' }
    ];

    const loanData = {
        status: 'Current',
        applicationId: '1000001',
        product: 'Business Loan',
        reminders: 'None',
        disbursedBy: 'Cash',
        principalAmount: 'RF 100 000 000,00',
        releaseDate: '28/06/2025',
        interestMethod: 'Flat Rate',
        interest: '2%/Day(Nominal APR: 720%)',
        duration: '1 Days',
        repaymentCycle: 'Monthly',
        numberOfRepayments: '1',
        decimalPlaces: 'Round Off to 2 Decimal Places',
        interestStartDate: '28/06/2025',
        description: 'None',
        sourceOfPrincipal: 'Cash',
        openDate: '28/06/2025 12:00 AM',
        addedDate: '28/06/2025 10:22am',
        lastEditedDate: '28/06/2025 10:22am',
        lastEditedBy: 'MURENZI Dev'
    };



    const InfoRow = ({ label, value, isLink = false }) => (
        <div className="flex py-2 border-b border-gray-100">
            <div className="w-1/3 text-sm font-medium text-gray-700 pr-4">
                {label}
            </div>
            <div className="w-2/3 text-sm text-gray-900">
                {isLink ? (
                    <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                        {value}
                    </a>
                ) : (
                    value
                )}
            </div>
        </div>
    );

    const SectionHeader = ({ title }) => (
        <div className="bg-slate-600 text-white px-4 py-2 text-sm font-medium">
            {title}
        </div>
    );


    return (
        <div>
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border-b border-gray-200">
                {actionButtons.map((button) => (
                    <button
                        key={button.label}
                        className={`px-4 py-2 text-sm font-medium rounded cursor-pointer transition-colors ${button.variant === 'primary'
                            ? 'bg-blue-400 text-white hover:bg-blue-500'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {button.label}
                    </button>
                ))}




            </div>
            <div className="bg-white">
                <div className=" mx-auto">
                    {/* Basic Loan Information */}
                    <div className="bg-white border border-gray-200 mb-1">
                        <div className="p-4">
                            <InfoRow label="Loan Status" value={loanData.status} />
                            <InfoRow label="Loan Application ID" value={loanData.applicationId} isLink={true} />
                            <InfoRow label="Loan Product" value={loanData.product} isLink={true} />
                            <div className="flex py-2">
                                <div className="w-1/3 text-sm font-medium text-gray-700 pr-4">
                                    Loan Reminders
                                </div>
                                <div className="w-2/3 text-sm">
                                    <div className="text-gray-900 mb-1">{loanData.reminders}</div>
                                    <a href="#" className="text-blue-600 hover:text-blue-800 underline text-sm">
                                        Set loan reminders
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loan Terms Section */}
                    <div className="bg-white border border-gray-200 mb-1">
                        <SectionHeader title="Loan Terms" />
                        <div className="p-4">
                            <InfoRow label="Disbursed By" value={loanData.disbursedBy} />
                            <InfoRow label="Principal Amount" value={loanData.principalAmount} />
                            <InfoRow label="Loan Release Date" value={loanData.releaseDate} />
                            <InfoRow label="Loan Interest Method" value={loanData.interestMethod} />
                            <InfoRow label="Loan Interest" value={loanData.interest} />
                            <InfoRow label="Loan Duration" value={loanData.duration} />
                            <InfoRow label="Repayment Cycle" value={loanData.repaymentCycle} />
                            <InfoRow label="Number of Repayments" value={loanData.numberOfRepayments} />
                            <InfoRow label="Decimal Places" value={loanData.decimalPlaces} />
                            <InfoRow label="Interest Start Date" value={loanData.interestStartDate} />
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white border border-gray-200 mb-1">
                        <SectionHeader title="Description" />
                        <div className="p-4">
                            <div className="text-sm text-gray-900">{loanData.description}</div>
                        </div>
                    </div>

                    {/* Accounting Section */}
                    <div className="bg-white border border-gray-200 mb-1">
                        <SectionHeader title="Accounting" />
                        <div className="p-4">
                            <InfoRow label="Source of Principal Amount" value={loanData.sourceOfPrincipal} />
                        </div>
                    </div>

                    {/* Loan Status History Section */}
                    <div className="bg-white border border-gray-200 mb-1">
                        <SectionHeader title="Loan Status History" />
                        <div className="p-4">
                            <InfoRow label="Open:" value={loanData.openDate} />
                            <div className="mt-4">
                                <button className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors">
                                    Update Loan Status Dates and Times
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer Information */}
                    <div className="p-4 text-sm text-gray-600 italic">
                        <div className="mb-1">
                            Loan added on {loanData.addedDate}
                        </div>
                        <div>
                            Loan last edited on {loanData.lastEditedDate} by {loanData.lastEditedBy}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default LoanTerms
