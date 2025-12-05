// js/data.js

export const checklistsData = {
    external: [
        { title: "Phase 1: Pre-Consultation", items: ["<strong>Contract Review:</strong> View all contract details first."] },
        {
            title: "Phase 2: Client Requirements Gathering",
            subtitle: "<strong>Action:</strong> Confirm all of the following requirements directly with the client.",
            sections: [
                {
                    title: "Badges & Supplies", items: [
                        "<strong>Badge Type:</strong> (e.g., Paper, PVC)",
                        "<strong>Badge Amount:</strong> Total quantity needed.",
                        "<strong>Holders:</strong> Are badge holders needed (if using paper cards)?",
                        "<strong>Sleeves:</strong> Are sleeves needed (if using PVC badges)?",
                        "<strong>Lanyards:</strong> Are they required? Will they be standard or custom?"
                    ]
                },
                {
                    title: "Hardware & Network", items: [
                        "<strong>Printers:</strong> Number of printers required.",
                        "<strong>iPads:</strong> Number of iPads required.",
                        "<strong>WiFi Routers:</strong> Number of routers required."
                    ]
                },
                {
                    title: "Logistics & Setup", items: [
                        "<strong>Delivery Address:</strong>",
                        "<strong>Delivery Date:</strong> Preferred date for delivery.",
                        "<strong>Ship-out Date:</strong> Preferred date for equipment removal.",
                        "<strong>Kiosk Setup Plan:</strong> Details on location, vicinity, and physical setup (e.g., same shelf/desk)."
                    ]
                },
                {
                    title: "Point of Contact (POC)", items: [
                        "<strong>POC Details:</strong> Get the main contact's information.",
                        "<strong>Verification:</strong> This person must match the name on the Vendor Order invoice."
                    ]
                }
            ]
        },
        {
            title: "Phase 3: Internal Admin", items: [
                "<strong>VG Sheet:</strong> Fill out the VG Sheet timely with all gathered information.",
                "<strong>Onsite Rep:</strong> If an onsite representative is needed, fill out the onsite rep form after taking input from client."
            ]
        }
    ],
    internal: [
        {
            title: "1. Equipment & Hardware", items: [
                "<strong>Laptops:</strong> Mandatory for Epson, ZC10L, and Evolis printers.",
                "<strong>Cables:</strong> If using laptops, ensure all appropriate cables/switches are included in the VG Order.",
                "<strong>Routers:</strong> Must be Data Connection (preferably eSIM) based, not ethernet.",
                "<strong>Printer Specifics:</strong> For Zebra ZD620/61 printers, we are limited to inbuilt fonts only (no custom fonts)."
            ]
        },
        {
            title: "2. Onsite Logistics & Network Setup", items: [
                "<strong>Kiosk Setup:</strong> If onsite printing kiosks are not bundled, the PM must review the setup with the client and place orders for extension leads, routers, and other equipment accordingly.",
                "Followup timely with VG team to assign reps + fill out form.",
                "<strong>Venue Check:</strong> Confirm with the customer that the registration setup space is not in the basement to ensure good signal connectivity for WiFi Routers.",
                "<strong>Equipment Ratios:</strong> The Router-to-Printer ratio should be approximately 1:2. If this ratio is not met, add Ethernet switches to the order."
            ]
        },
        {
            title: "3. Software & Configuration", items: [
                "<strong>App Setup:</strong> In the badge printing app, ensure the kiosk screen is created from the backend.",
                "<strong>Badge Design Ticket (Onsite):</strong> If the event is for Onsite printing (Evolis, ZC10L, Epson), create a ticket for the frontend team for the badge HTML design.",
                "<strong>Mobile Printing Ticket:</strong> Before the event is live, the PM must create a ticket for the mobile team for field printing."
            ]
        },
        {
            title: "4. Supplies & Vendor Management", items: [
                "<strong>Order Review:</strong> PM must review the VG Order very carefully before confirming with the vendor.",
                "<strong>Badge Quantity:</strong>",
                "<ul><li><strong>Formula:</strong> Client requirement + 250 extra badges for every 2,000.</li><li><strong>Note:</strong> This is client-dependent; consult with the CSM and use your judgment.</li></ul>"
            ]
        },
        {
            title: "5. Design, Testing & Quality Assurance (QA)", items: [
                "<strong>Preprinting Proof:</strong> The badge proof shared by the vendor must be reviewed carefully against the client's design.",
                "<strong>Client Sign-off:</strong> The proof must be counter-signed by the client before giving the vendor a go-ahead.",
                "<strong>Print Testing:</strong> Print test badges using the \"worst-case\" scenarios (e.g., longest names) to ensure no fields are cut off. (Anomalies can be ignored).",
                "<strong>Share Tests:</strong> These test prints must be shared in the internal WhatsApp group."
            ]
        },
        {
            title: "6. Communication & Admin", items: [
                "<strong>Internal WhatsApp Group:</strong>",
                "<ul><li>Create the group.</li><li>Update the group's description to include event details.</li><li>Add: Anmol, Khadija, Hareem, CSM, Sana, and Zain.</li></ul>",
                "<strong>External WhatsApp Group:</strong>",
                "<ul><li>Create the group.</li><li>Add: CSM/AE.</li><li>Client + Internal Whatsapp Group Members</li></ul>"
            ]
        }
    ]
};

export const summaryLabels = {
    pmName: 'Project Manager',
    eventDate: 'Event Date',
    timeframe: 'Calculated Lead Time',
    badgeType_longTimeframe: 'Badge Type',
    badgeType_shortTimeframe: 'Badge Type',
    pvcSleeve: 'Sleeve Required',
    pvcSleeve_shortTimeframe: 'Sleeve Required',
    pvcBadgeDesign: 'PVC Design',
    pvcBadgeDesign_shortTimeframe: 'PVC Design',
    pvcColorBw_shortTimeframe: 'PVC Design Color',
    pvcFieldsColor_shortTimeframe: 'PVC Field Color',
    idCardBadgeDesign_shortTimeframe: 'ID Card Design',
    idCardColorBw_shortTimeframe: 'ID Card Design Color',
    idCardFieldsColor_shortTimeframe: 'ID Card Field Color',
    pvcOrIdBadgeDesign_shortTimeframe: 'Badge Design',
    pvcOrIdColorBw_shortTimeframe: 'Design Color',
    pvcOrIdOnsitePreprint_shortTimeframe: 'Printing Method',
    fieldsColorRouter_shortTimeframe: 'Field Color',
    noSleeveColorBw: 'Badge Color',
    onsiteOrPreprint: 'Printing Method',
    noSleevePreprintColorBw: 'Preprint Field Color',
    pvcNoDesignPreprintFields: 'Preprint Field Color',
    tearResistantBadgeDesign: 'Tear-Resistant Design',
    tearResistantBadgeDesign_shortTimeframe: 'Tear-Resistant Design',
    tearResistantColorBw: 'TR Badge Color',
    tearResistantColorBw_shortTimeframe: 'TR Badge Color',
    tearResistantOnsitePreprint: 'TR Printing Method',
    tearResistantPreprintFields: 'TR Preprint Field Color',
    tearResistantOnsitePreprint_shortTimeframe: 'TR Printing Method',
    tearResistantOnsiteFields_shortTimeframe: 'TR Onsite Field Color',
    paperBadgeDesign_longTimeframe: 'Paper Design',
    paperColorBw_longTimeframe: 'Paper Design Color',
    paperColorOnsitePreprint_longTimeframe: 'Paper Color Printing Method',
    paperBwOnsitePreprint_longTimeframe: 'Paper B/W Printing Method',
    paperBwFieldsColor_longTimeframe: 'Paper B/W Field Color',
};

// --- DECISION FLOWS ---
const coreFlow = {
    'start': {
        render: (state, methods) => `
            <div class="step-content text-center">
                <h1 class="text-3xl font-bold mb-4">Badge Printing Decision Guide</h1>
                <p class="text-slate-600 mb-8 max-w-md mx-auto">Let's find the perfect badge printing solution for your event. This guide will walk you through a few simple questions.</p>
                <div class="flex flex-col gap-3 max-w-xs mx-auto">
                    <button data-action="navigate" data-next="pmName" class="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-sky-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">Start Setup</button>
                    
                    ${state.hasSavedData ? `<button id="resume-btn" class="bg-white text-sky-600 border-2 border-sky-600 font-bold py-2 px-8 rounded-lg hover:bg-sky-50 transition-all">Resume Progress</button>` : ''}
                </div>
            </div>
        `,
        isStart: true,
        totalSteps: 8,
    },
    'pmName': {
        question: "Let's start with your Project Manager's Name.",
        type: 'text',
        placeholder: "Select or type name...",
        next: 'timeframe',
        stepNumber: 1,

    },
    'timeframe': {
        question: "When is your event going live?",
        type: 'date',
        stepNumber: 2,
    },
    'badgeType_longTimeframe': {
        question: "What type of badge are you looking for?",
        type: 'options',
        stepNumber: 3,
        options: [
            { text: 'PVC (Plastic)', icon: '💳', next: 'pvcSleeve', imageUrl: 'assets/pvc_badge.png', tooltip: 'Durable, credit-card like material. Ideal for multi-day or professional events.' },
            { text: 'ID Card', icon: '🆔', next: 'pvcBadgeDesign', imageUrl: 'assets/id_card.png', tooltip: 'Standard ID card format, often used with photos.' },
            { text: 'Tear Resistant', icon: '💪', next: 'tearResistantBadgeDesign', imageUrl: 'assets/tear_resistant.png', tooltip: 'Synthetic paper that resists tearing and water damage.' },
            { text: 'Paper Badges', icon: '📄', next: 'paperBadgeDesign_longTimeframe', imageUrl: 'assets/paper_badge.png', tooltip: 'Cost-effective and ideal for single-day events.' }
        ]
    },
    'badgeType_shortTimeframe': {
        question: "What type of badge are you looking for?",
        type: 'options',
        stepNumber: 3,
        options: [
            { text: 'PVC (Plastic)', icon: '💳', next: 'pvcSleeve_shortTimeframe', imageUrl: 'assets/pvc_badge.png', tooltip: 'Durable, credit-card like material. Ideal for multi-day or professional events.' },
            { text: 'ID Card', icon: '🆔', next: 'pvcOrIdBadgeDesign_shortTimeframe', imageUrl: 'assets/id_card.png', tooltip: 'Standard ID card format, often used with photos.' },
            { text: 'Tear Resistant', icon: '💪', next: 'tearResistantBadgeDesign_shortTimeframe', imageUrl: 'assets/tear_resistant.png', tooltip: 'Synthetic paper that resists tearing and water damage.' },
            { text: 'Paper Badges', icon: '📄', next: 'paperBadgeDesign_longTimeframe', imageUrl: 'assets/paper_badge.png', tooltip: 'Cost-effective and ideal for single-day events.' }
        ]
    },
};

const pvcFlow = {
    // 4+ week flow
    'pvcSleeve': { question: "Will the PVC badges require a sleeve?", imageUrl: 'assets/sleeve_example.png', type: 'options', stepNumber: 4, options: [{ text: 'Yes, with a sleeve', icon: '✅', next: 'sleevePreprintResult' }, { text: 'No, just the card', icon: '❌', next: 'pvcBadgeDesign' }] },
    'pvcBadgeDesign': { question: "Do you have a badge design?", type: 'options', stepNumber: 5, options: [{ text: 'Yes', icon: '🎨', next: 'noSleeveColorBw' }, { text: 'No', icon: '❓', next: 'pvcNoDesignPreprintFields' }] },
    'noSleeveColorBw': { question: "Will the badge design be printed in Color or B/W?", type: 'options', stepNumber: 6, options: [{ text: 'Color', icon: '🎨', next: 'onsiteOrPreprint' }, { text: 'Black & White', icon: '⚫', next: 'onsiteOrPreprint' }] },
    'onsiteOrPreprint': { question: "Will the printing be done Onsite or Preprint?", tooltip: "Onsite offers flexibility for last-minute changes. Preprint is often more cost-effective for large, fixed attendee lists.", type: 'options', stepNumber: 7, options: [{ text: 'Onsite', icon: '🏢', next: 'onsiteRouter' }, { text: 'Preprint', icon: '🏭', next: 'noSleevePreprintColorBw' }] },
    'noSleevePreprintColorBw': { question: "For preprint, will the fields be in Color or B/W?", type: 'options', stepNumber: 8, options: [{ text: 'Color', icon: '🎨', next: 'preprintRouter' }, { text: 'Black & White', icon: '⚫', next: 'bwZebraStickerResult' }] },
    'pvcNoDesignPreprintFields': { question: "For preprint, will the fields be in Color or B/W?", type: 'options', stepNumber: 6, options: [{ text: 'Color', icon: '🎨', next: 'preprintRouter' }, { text: 'Black & White', icon: '⚫', next: 'bwZebraStickerResult' }] },

    // 2-3 Week PVC Flow (and ID Card shared flow)
    'pvcSleeve_shortTimeframe': { question: "Will the PVC badges require a sleeve?", imageUrl: 'assets/sleeve_example.png', type: 'options', stepNumber: 4, options: [{ text: 'Yes, with a sleeve', icon: '✅', next: 'notPossibleSleeveResult' }, { text: 'No, just the card', icon: '❌', next: 'pvcOrIdBadgeDesign_shortTimeframe' }] },
    'pvcOrIdBadgeDesign_shortTimeframe': { question: "Do you have a badge design?", type: 'options', stepNumber: 5, options: [{ text: 'Yes', icon: '🎨', next: 'pvcOrIdColorBw_shortTimeframe' }, { text: 'No', icon: '❓', next: 'fieldsColorRouter_shortTimeframe' }] },
    'pvcOrIdColorBw_shortTimeframe': { question: "Will the badge design be printed in Color or B/W?", type: 'options', stepNumber: 6, options: [{ text: 'Color', icon: '🎨', next: 'pvcOrIdOnsitePreprint_shortTimeframe' }, { text: 'Black & White', icon: '⚫', next: 'pvcOrIdOnsitePreprint_shortTimeframe' }] },
    'pvcOrIdOnsitePreprint_shortTimeframe': { question: "Will printing be Onsite or Preprint?", type: 'options', stepNumber: 7, options: [{ text: 'Onsite', icon: '🏢', next: 'fieldsColorRouter_shortTimeframe' }, { text: 'Preprint', icon: '🏭', next: 'notPossibleTearResistantPreprintColorResult' }] },
    'fieldsColorRouter_shortTimeframe': { question: "For the variable fields, will they be printed in Color or B/W?", type: 'options', stepNumber: 8, options: [{ text: 'Color', icon: '🎨', next: 'finalSolutionRouter_shortTimeframe' }, { text: 'Black & White', icon: '⚫', next: 'finalSolutionRouter_shortTimeframe' }] },

};

const tearResistantFlow = {
    // 4+ and 3-4 week flow
    'tearResistantBadgeDesign': { question: "Do you have a design for the tear-resistant badges?", type: 'options', stepNumber: 4, options: [{ text: 'Yes', icon: '🎨', next: 'tearResistantColorBw' }, { text: 'No', icon: '❓', next: 'tearResistantPreprintFields' }] },
    'tearResistantColorBw': { question: "Will the design be Color or B/W?", type: 'options', stepNumber: 5, options: [{ text: 'Color', icon: '🎨', next: 'tearResistantOnsitePreprint' }, { text: 'Black & White', icon: '⚫', next: 'tearResistantPreprintFields' }] },
    'tearResistantOnsitePreprint': { question: "Will printing be Onsite or Preprint?", type: 'options', stepNumber: 6, options: [{ text: 'Onsite', icon: '🏢', next: 'epsonTearResistantResult' }, { text: 'Preprint', icon: '🏭', next: 'tearResistantPreprintFields' }] },
    'tearResistantPreprintFields': { question: "For preprint, will the fields be in Color or B/W?", type: 'options', stepNumber: 6, options: [{ text: 'Color', icon: '🎨', next: 'epsonTearResistantResult' }, { text: 'Black & White', icon: '⚫', next: 'tearResistantZebraOrStickerResult' }] },

    // 2-3 week flow
    'tearResistantBadgeDesign_shortTimeframe': { question: "Do you have a design for the tear-resistant badges?", type: 'options', stepNumber: 4, options: [{ text: 'Yes', icon: '🎨', next: 'tearResistantColorBw_shortTimeframe' }, { text: 'No', icon: '❓', next: 'tearResistantResultZebra' }] },
    'tearResistantColorBw_shortTimeframe': { question: "Will the design be Color or B/W?", type: 'options', stepNumber: 5, options: [{ text: 'Color', icon: '🎨', next: 'tearResistantOnsitePreprint_shortTimeframe' }, { text: 'Black & White', icon: '⚫', next: 'tearResistantResultZebra' }] },
    'tearResistantOnsitePreprint_shortTimeframe': { question: "Will printing be Onsite or Preprint?", type: 'options', stepNumber: 6, options: [{ text: 'Onsite', icon: '🏢', next: 'tearResistantOnsiteFields_shortTimeframe' }, { text: 'Preprint', icon: '🏭', next: 'notPossibleTearResistantPreprintColorResult' }] },
    'tearResistantOnsiteFields_shortTimeframe': { question: "For the variable fields, will they be printed in Color or B/W?", type: 'options', stepNumber: 7, options: [{ text: 'Color', icon: '🎨', next: 'epsonTearResistantResult' }, { text: 'Black & White', icon: '⚫', next: 'epsonTearResistantResult' }] },
};

const paperFlow = {
    'paperConsultVGTeam': {
        render: (state, methods) => `
            <div class="step-content text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v4z"></path></svg></div>
                <h2 class="text-2xl font-bold mb-4">Action Required</h2>
                <p class="text-slate-600 mb-8 max-w-md mx-auto">For paper badges, please consult with the VG Team before proceeding.</p>
                <button data-action="navigate" data-next="paperBadgeDesign_shortTimeframe" class="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-sky-700 transition-all">Continue</button>
            </div>
        `,
        stepNumber: 4,
    },
    'paperBadgeDesign_longTimeframe': { question: "Do you have a design for the paper badges?", type: 'options', stepNumber: 4, options: [{ text: 'Yes', icon: '🎨', next: 'paperColorBw_longTimeframe' }, { text: 'No', icon: '❓', next: 'paperResultZebraHolder' }] },
    'paperColorBw_longTimeframe': { question: "Will the design be Color or B/W?", type: 'options', stepNumber: 5, options: [{ text: 'Color', icon: '🎨', next: 'paperColorOnsitePreprint_longTimeframe', imageUrl: 'assets/paper_badge-color.png' }, { text: 'Black & White', icon: '⚫', next: 'paperBwOnsitePreprint_longTimeframe', imageUrl: 'assets/paper_badge -black.png' }] },
    'paperColorOnsitePreprint_longTimeframe': { question: "Will printing be Onsite or Preprint?", type: 'options', stepNumber: 6, options: [{ text: 'Onsite', icon: '🏢', next: 'notPossiblePaperColorResult' }, { text: 'Preprint', icon: '🏭', next: 'paperBwFieldsColor_longTimeframe' }] },
    'paperBwOnsitePreprint_longTimeframe': { question: "Will printing be Onsite or Preprint?", type: 'options', stepNumber: 6, options: [{ text: 'Onsite', icon: '🏢', next: 'paperBwFieldsColor_longTimeframe' }, { text: 'Preprint', icon: '🏭', next: 'paperBwFieldsColor_longTimeframe' }] },
    'paperBwFieldsColor_longTimeframe': { question: "For the variable fields, will they be printed in Color or B/W?", type: 'options', stepNumber: 7, options: [{ text: 'Color', icon: '🎨', next: 'notPossiblePaperColorResult' }, { text: 'Black & White', icon: '⚫', next: 'paperResultZebra' }] },
};

export const decisionTree = {
    ...coreFlow,
    ...pvcFlow,
    ...tearResistantFlow,
    ...paperFlow,
    // Results are defined below
    'consultTeamResult': {
        isResult: true,
        title: 'Action Required',
        subtitle: 'For tight deadlines:',
        mainPoint: 'Consult with your team lead over tight deadlines.',
        isUrgent: true,
    },
    'idCardResult': {
        isResult: true,
        imageUrl: 'assets/id_card_print_setup.png',
        title: 'ID Card Solution',
        subtitle: 'For ID Cards, we recommend:',
        mainPoint: 'Evolis + ID Cards + Laptop',
    },
    'notPossibleSleeveResult': {
        isResult: true,
        title: 'Not Possible in Time',
        subtitle: 'A sleeved PVC badge with a custom design is not feasible.',
        mainPoint: 'Please consult your Team Lead or Regional Head.',
        isUrgent: true,
    },
    'notPossibleTearResistantPreprintColorResult': {
        isResult: true,
        title: 'Not Possible in Time',
        subtitle: 'Pre-printing a custom design is not feasible in a 2-3 week timeframe.',
        mainPoint: 'Please select an Onsite printing solution.',
        isUrgent: true,
    },
    'notPossiblePaperColorResult': {
        isResult: true,
        title: 'Not Possible',
        subtitle: 'Color printing for paper badges is not available with this setup.',
        mainPoint: 'Non lanyard, Single sided possible, Badge holder required.',
        isUrgent: true,
    },
    'sleevePreprintResult': {
        isResult: true,
        imageUrl: 'assets/printer_zebra.png',
        title: 'Sleeved Badge Solution',
        subtitle: 'The recommended setup is:',
        mainPoint: 'Preprint Only with ZD620/21',
    },
    'bwZebraStickerResult': {
        isResult: true,
        imageUrl: 'assets/printer_zebra.png',
        title: 'B/W Printing Solution',
        subtitle: 'The recommended hardware is:',
        mainPoint: 'Zebra ZD620/21 + Sticker Paper + PVC Cards',
    },
    'pvcColorOnsiteResult': {
        isResult: true,
        imageUrl: 'assets/printer_zc10l.png',
        title: 'Color PVC Solution',
        subtitle: 'For this requirement, we recommend:',
        mainPoint: 'ZC10L Printer + PVC Cards + Laptop',
    },
    'speedPrinterResult': {
        isResult: true,
        imageUrl: 'assets/printer_epson.png',
        title: 'No-Design PVC Solution',
        subtitle: 'For PVC without a design, the solution is:',
        mainPoint: 'Epson Printer + Tear Resistant (Epson Compatible) Badges + Laptop',
    },
    'tearResistantResultZebra': {
        isResult: true,
        imageUrl: 'assets/printer_zebra.png',
        title: 'Tear Resistant Solution',
        subtitle: 'The recommended hardware is:',
        mainPoint: 'Zebra ZD620/21 + Tear Resistant Badges',
    },
    'epsonTearResistantResult': {
        isResult: true,
        imageUrl: 'assets/printer_epson.png',
        title: 'Tear Resistant Color Solution',
        subtitle: 'The recommended hardware is:',
        mainPoint: 'Epson Printer + Tear Resistant (Epson Compatible) Badges + Laptop',
    },
    'tearResistantZebraOrStickerResult': {
        isResult: true,
        imageUrl: 'assets/printer_zebra.png',
        title: 'Tear Resistant B/W Solution',
        subtitle: 'The recommended hardware is:',
        mainPoint: 'Zebra ZD620/21 + Tear Resistant Badges OR Zebra ZD620/21 + Tear Resistant Badges + Sticker',
    },
    'educateClientResult': {
        isResult: true,
        imageUrl: 'assets/reception_team.png',
        title: 'Action Required',
        subtitle: 'For tear-resistant badges without a design:',
        mainPoint: 'Educate the client on design options and requirements.',
    },
    'paperResultZebra': {
        isResult: true,
        imageUrl: 'assets/printer_zebra.png',
        title: 'Paper Badge Solution',
        subtitle: 'The recommended hardware is:',
        mainPoint: 'Zebra ZD620/21 + Paper Badges',
    },
    'paperResultZebraHolder': {
        isResult: true,
        imageUrl: 'assets/printer_zebra.png',
        title: 'Paper Badge Solution (No Design)',
        subtitle: 'The recommended hardware is:',
        mainPoint: 'Zebra ZD620/21 + Paper Badge + Holder',
    },
};