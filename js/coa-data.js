/* ================================================================
   OPTIMA LABS — Certificate of Analysis (COA) data
   Single source for the Lab Verification page + the "Quality
   Assurance" block on each product page.

   Each entry links to the REAL public third-party verification page
   (verifyURL, opens in a new tab). To add a certificate:
     • copy an entry, set the real name / purity / date
     • paste the verifyURL from your certified lab report
     • set `slug` to match the Shop product slug (for deep-links)
     • coaURL is optional — a direct PDF link embeds a preview
   The site is laboratory-neutral by design: certificates are shown
   as independently third-party verified, without naming a single lab.
   ================================================================ */
(function () {
  window.COA_DATA = [
    { slug:'ipamorelin', name:'Ipamorelin', dosage:'10mg', category:'Recovery & Repair', purity:'99.7%', tested:'Mar 2024', coaURL:'',
      verifyURL:'https://janoshik.com/tests/150869-Ipamorelin_10mg_V7QVXXGBFB2G' },
    { slug:'bpc-157', name:'BPC-157', dosage:'5mg', category:'Recovery & Repair', purity:'99.6%', tested:'Mar 2024', coaURL:'',
      verifyURL:'https://verify.janoshik.com/tests/154035-BPC157_5mg_6JW9EI82MZML' },
    { slug:'cjc-1295-dac', name:'CJC-1295 DAC', dosage:'', category:'Recovery & Repair', purity:'99.5%', tested:'Apr 2024', coaURL:'',
      verifyURL:'https://janoshik.com/tests/163404-CJC1295_DAC_WKCUHZQK1X4Y' },
    { slug:'tirzepatide', name:'Tirzepatide', dosage:'30mg (Red Cap)', category:'Weight Management', purity:'99.3%', tested:'Mar 2024', coaURL:'',
      verifyURL:'https://verify.janoshik.com/tests/156439-Tirzepatide_30mg_Red_Cap_FIPPQMVY85B1' },
    { slug:'ghk-cu', name:'GHK-Cu', dosage:'100mg', category:'Skin & Beauty', purity:'99.8%', tested:'Mar 2024', coaURL:'',
      verifyURL:'https://verify.janoshik.com/tests/154037-GHKCu_100mg_6GUX9RNQ9N4C' },
    { slug:'retatrutide', name:'Retatrutide', dosage:'20mg', category:'Weight Management', purity:'99.4%', tested:'Mar 2024', coaURL:'',
      verifyURL:'https://verify.janoshik.com/tests/152066-Retatrutide_20mg_DNHKZRP7EMLA' }
  ];
})();
