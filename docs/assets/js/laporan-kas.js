// URL API Google Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbzICofsGL3UVxhVXb49uW83y-ZpQ8v73NOBL_ywJKpNh78RHfHjKPQMIRmE218Vn_-_/exec';

// Format angka ke Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// Format tanggal ke format Indonesia
function formatTanggal(tanggal) {
    if (!tanggal) return '-';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(tanggal).toLocaleDateString('id-ID', options);
}

// Fungsi untuk memuat data dari API
async function loadData() {
    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = '<p class="loading-message">Memuat data transaksi...</p>';
    
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Gagal mengambil data: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Periksa status response
        if (result.status !== 'success') {
            throw new Error('API tidak mengembalikan status success');
        }
        
        // Pastikan data adalah array
        const dataArray = Array.isArray(result.data) ? result.data : [result.data];
        
        if (dataArray.length === 0) {
            dataContainer.innerHTML = '<p class="error-message">Tidak ada data transaksi ditemukan.</p>';
            return;
        }
        
        // Urutkan data berdasarkan tanggal (terbaru pertama)
        dataArray.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
        
        renderTable(dataArray);
        
    } catch (error) {
        console.error('Error:', error);
        dataContainer.innerHTML = `<p class="error-message">Gagal memuat data: ${error.message}</p>`;
    }
}

// Fungsi untuk membuat tabel
function renderTable(data) {
    const dataContainer = document.getElementById('data-container');
    
    const table = document.createElement('table');
    table.id = 'transactionsTable';
    
    // Buat header tabel
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = [
        'No', 'Tanggal', 'Uraian', 'Kategori', 
        'Pemasukan', 'Pengeluaran', 'Saldo', 'Keterangan'
    ];
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Buat body tabel
    const tbody = document.createElement('tbody');
    
    data.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // Format nilai keuangan
        const pemasukan = item.pemasukan || 0;
        const pengeluaran = item.pengeluaran || 0;
        const saldo = item.saldo || 0;
        
        // Buat sel-sel tabel
        const cells = [
            index + 1,
            formatTanggal(item.tanggal),
            item.uraian || '-',
            item.kategori || '-',
            pemasukan > 0 ? `<span class="positive">${formatRupiah(pemasukan)}</span>` : '-',
            pengeluaran > 0 ? `<span class="negative">${formatRupiah(pengeluaran)}</span>` : '-',
            formatRupiah(saldo),
            item.keterangan || '-',
        ];
        
        cells.forEach(cellContent => {
            const td = document.createElement('td');
            td.innerHTML = cellContent;
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    dataContainer.innerHTML = '';
    dataContainer.appendChild(table);
}

// Fungsi untuk pencarian
function searchTable() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toUpperCase();
    const table = document.getElementById('transactionsTable');
    const tr = table ? table.getElementsByTagName('tr') : [];
    
    for (let i = 1; i < tr.length; i++) {
        let found = false;
        const tdList = tr[i].getElementsByTagName('td');
        
        for (let j = 0; j < tdList.length; j++) {
            const td = tdList[j];
            if (td) {
                const txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        
        tr[i].style.display = found ? '' : 'none';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Tambahkan event listener untuk tombol refresh
    document.querySelector('.refresh-btn').addEventListener('click', loadData);
    
    // Tambahkan event listener untuk search box
    document.getElementById('searchInput').addEventListener('keyup', searchTable);
});

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
  // Toggle sidebar di mobile
  document.addEventListener('click', function(e) {
    if (e.target.closest('.menu-toggle')) {
      document.querySelector('.sidebar').classList.toggle('active');
      document.querySelector('.main-content').classList.toggle('sidebar-active');
    }
  });
