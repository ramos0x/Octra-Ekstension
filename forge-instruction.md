# Octra Extension - Wallet Connection Issue

## Problem Description

Pada handling request koneksi dari dapp ke wallet, ketika user memilih menggunakan wallet yang tidak aktif, terjadi masalah berikut:

### Scenario
- Misal ada 2 wallet:
  - Wallet 1 (aktif/selected)
  - Wallet 2 (tidak aktif/not selected)

### Issue
Dapp tetap menggunakan wallet yang aktif padahal user memilih wallet yang ke-2.

### Root Cause
User harus memilih wallet aktif dulu di extension wallet. Extension akan selalu menggunakan wallet yang sedang aktif untuk memproses interaksi, walaupun user memilih wallet lain yang bukan dalam state aktif.

## Expected Behavior
Dapp seharusnya menggunakan wallet yang dipilih user, bukan wallet yang sedang aktif di extension.

## Solution Required
Extension perlu dimodifikasi agar dapat menggunakan wallet yang dipilih user secara langsung, tanpa mengharuskan user untuk mengaktifkan wallet tersebut terlebih dahulu.