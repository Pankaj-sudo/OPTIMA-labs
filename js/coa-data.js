/* ================================================================
   OPTIMA LABS — Certificate of Analysis (COA) data
   Single source for the Lab Verification page + the "Quality
   Assurance" block on each product page.

   Each entry links to the REAL public Janoshik verification page
   (janoshikURL, opens in a new tab). To add a certificate:
     • copy an entry, set the real name / purity / batch / date
     • paste the janoshikURL from your Janoshik report
     • set `slug` to match the Shop product slug (for deep-links)
     • coaURL is optional — a direct PDF link embeds a preview
   ================================================================ */
(function () {
  var LAB = 'Janoshik Analytical';
  window.COA_DATA = [
    { slug:'ipamorelin', name:'Ipamorelin', dosage:'10mg', category:'Recovery & Repair', purity:'99.7%', batch:'V7QVXXGBFB2G', tested:'Mar 2024', lab:LAB, coaURL:'',
      janoshikURL:'https://janoshik.com/tests/150869-Ipamorelin_10mg_V7QVXXGBFB2G' },
    { slug:'bpc-157', name:'BPC-157', dosage:'5mg', category:'Recovery & Repair', purity:'99.6%', batch:'6JW9EI82MZML', tested:'Mar 2024', lab:LAB, coaURL:'',
      janoshikURL:'https://verify.janoshik.com/tests/154035-BPC157_5mg_6JW9EI82MZML' },
    { slug:'cjc-1295-dac', name:'CJC-1295 DAC', dosage:'', category:'Recovery & Repair', purity:'99.5%', batch:'WKCUHZQK1X4Y', tested:'Apr 2024', lab:LAB, coaURL:'',
      janoshikURL:'https://janoshik.com/tests/163404-CJC1295_DAC_WKCUHZQK1X4Y' },
    { slug:'tirzepatide', name:'Tirzepatide', dosage:'30mg (Red Cap)', category:'Weight Management', purity:'99.3%', batch:'FIPPQMVY85B1', tested:'Mar 2024', lab:LAB, coaURL:'',
      janoshikURL:'https://verify.janoshik.com/tests/156439-Tirzepatide_30mg_Red_Cap_FIPPQMVY85B1' },
    { slug:'ghk-cu', name:'GHK-Cu', dosage:'100mg', category:'Skin & Beauty', purity:'99.8%', batch:'6GUX9RNQ9N4C', tested:'Mar 2024', lab:LAB, coaURL:'',
      janoshikURL:'https://verify.janoshik.com/tests/154037-GHKCu_100mg_6GUX9RNQ9N4C' },
    { slug:'retatrutide', name:'Retatrutide', dosage:'20mg', category:'Weight Management', purity:'99.4%', batch:'DNHKZRP7EMLA', tested:'Mar 2024', lab:LAB, coaURL:'',
      janoshikURL:'https://verify.janoshik.com/tests/152066-Retatrutide_20mg_DNHKZRP7EMLA' }
  ];
})();
