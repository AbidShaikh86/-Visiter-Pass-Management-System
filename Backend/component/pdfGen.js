// i actually used this for first time i used ai for seeing how its work and its syntax 
// i didn't copy paste ok
const pdf = require('pdfkit')
const qrcode = require('qrcode')

async function createApptPdf(appt, res) {
    const doc = new pdf();
    const QR = await qrcode.toDataURL(appt._id.toString())

    res.setHeader('Content-Type', 'application/pdf');
    doc.fontSize(20).text('Appointment Pass',{align: 'center'}).moveDown();
    doc.fontSize(14).text(`Name:  ${appt.visitor_name}`)
    doc.text(`Host ID: ${appt.hostId}`);
    doc.text(`Status: ${appt.status}`);
    doc.image(QR, { fit: [150, 150], align: 'center' });
    doc.pipe(res);
    doc.end();
}

module.exports = createApptPdf