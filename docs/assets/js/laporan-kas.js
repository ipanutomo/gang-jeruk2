document.addEventListener('DOMContentLoaded', function() {
  // Elemen DOM
  const tableBody = document.getElementById('tableBody');
  const loadingElement = document.getElementById('loading');
  const errorElement = document.getElementById('error');
  const refreshBtn = document.getElementById('refreshBtn');
  const searchInput = document.getElementById('searchInput');
  
  // URL API - ganti dengan endpoint API Anda
  const API_URL = 'https://script.google.com/macros/s/AKfycbzICofsGL3UVxhVXb49uW83y-ZpQ8v73NOBL_ywJKpNh78RHfHjKPQMIRmE218Vn_-_/exec
';
  
  // Format mata uang
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };
  
  // Fungsi untuk memuat data dari API
  const loadData = async () => {
    try {
      // Tampilkan loading, sembunyikan error
      loadingElement.style.display = 'flex';
      errorElement.style.display = 'none';
      tableBody.innerHTML = '';
      
      // Fetch data dari API
      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Jika data kosong atau bukan array
      if (!Array.isArray(data)) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center;">Format data tidak valid</td>
          </tr>
        `;
        return;
      }
      
      if (data.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center;">Tidak ada data transaksi</td>
          </tr>
        `;
        return;
      }
      
      // Isi data ke tabel
      data.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${formatDate(item.tanggal)}</td>
          <td>${item.uraian || item.keterangan || '-'}</td>
          <td class="text-success">${item.pemasukan ? formatCurrency(item.pemasukan) : '-'}</td>
          <td class="text-danger">${item.pengeluaran ? formatCurrency(item.pengeluaran) : '-'}</td>
          <td class="text-primary">${formatCurrency(item.saldo)}</td>
        `;
        tableBody.appendChild(row);
      });
      
    } catch (error) {
      console.error('Error:', error);
      errorElement.textContent = 'Gagal memuat data: ' + error.message;
      errorElement.style.display = 'block';
    } finally {
      loadingElement.style.display = 'none';
    }
  };
  
  // Fungsi untuk pencarian
  const searchTable = () => {
    const filter = searchInput.value.toUpperCase();
    const rows = tableBody.getElementsByTagName('tr');
    
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i].getElementsByTagName('td');
      let found = false;
      
      for (let j = 0; j < cells.length; j++) {
        const cell = cells[j];
        if (cell) {
          const txtValue = cell.textContent || cell.innerText;
          if (txtValue.toUpperCase().indexOf(filter) > -1) {
            found = true;
            break;
          }
        }
      }
      
      rows[i].style.display = found ? '' : 'none';
    }
  };
  
  // Event listeners
  refreshBtn.addEventListener('click', loadData);
  searchInput.addEventListener('keyup', searchTable);
  
  // Load data pertama kali
  loadData();
});
