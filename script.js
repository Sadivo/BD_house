const { createApp } = Vue;

createApp({
    data() {
        return {
            rawRows: [],          // 原始資料
            selectedRegion: "",   // 選擇的地區
            selectedVillage: "",  // 選擇的村莊
            selectedUsage: "",    // 選擇的用途
            sortKey: "",          // 目前排序欄位
            sortOrder: 1          // 1 為升冪, -1 為降冪
        }
    },
    computed: {
        // 計算：篩選出不重複的「地區」選單
        uniqueRegions() {
            const regions = new Set(this.rawRows.map(r => r['地區']));
            return Array.from(regions).filter(Boolean).sort();
        },
        // 計算：篩選出不重複的「村莊」選單 (會隨地區連動，這裡先做全域顯示)
        uniqueVillages() {
            // 如果想要村莊選單隨地區改變，可以在這裡加過濾條件
            let list = this.rawRows;
            if(this.selectedRegion) {
                list = list.filter(r => r['地區'] === this.selectedRegion);
            }
            const villages = new Set(list.map(r => r['村莊']));
            return Array.from(villages).filter(Boolean).sort();
        },
        // 計算：篩選出不重複的「用途」選單
        uniqueUsages() {
            const usages = new Set(this.rawRows.map(r => r['用途']));
            return Array.from(usages).filter(Boolean).sort();
        },
        // 核心邏輯：根據篩選器與排序回傳最終資料
        filteredData() {
            let result = this.rawRows;

            // 1. 執行篩選
            if (this.selectedRegion) {
                result = result.filter(r => r['地區'] === this.selectedRegion);
            }
            if (this.selectedVillage) {
                result = result.filter(r => r['村莊'] === this.selectedVillage);
            }
            if (this.selectedUsage) {
                result = result.filter(r => r['用途'] === this.selectedUsage);
            }

            // 2. 執行排序
            if (this.sortKey) {
                result = result.slice().sort((a, b) => {
                    let valA = a[this.sortKey];
                    let valB = b[this.sortKey];

                    // 嘗試轉為數字比較 (處理 CP值、貢獻、格數)
                    const numA = parseFloat(valA);
                    const numB = parseFloat(valB);
                    
                    if (!isNaN(numA) && !isNaN(numB)) {
                        valA = numA;
                        valB = numB;
                    }

                    if (valA < valB) return -1 * this.sortOrder;
                    if (valA > valB) return 1 * this.sortOrder;
                    return 0;
                });
            }

            return result;
        }
    },
    methods: {
        // 載入 CSV 檔案
        loadCSV() {
            // 注意檔名
            Papa.parse("bdhouse.csv", {
                download: true,
                header: true,      // 告訴程式第一行是標題
                skipEmptyLines: true,
                complete: (results) => {
                    console.log("資料讀取成功", results.data);
                    this.rawRows = results.data;
                },
                error: (err) => {
                    console.error("讀取失敗:", err);
                    alert("讀取 CSV 失敗，請確認檔案是否存在且名稱正確 (需要透過 Local Server 開啟)");
                }
            });
        },
        // 點擊表頭排序 (修改版：加入第三次點擊取消排序)
        sortBy(key) {
            if (this.sortKey === key) {
                // 如果目前已經是針對這個欄位排序
                if (this.sortOrder === -1) {
                    // 狀態 1 (降冪) -> 狀態 2 (升冪)
                    this.sortOrder = 1;
                } else {
                    // 狀態 2 (升冪) -> 狀態 3 (取消排序)
                    this.sortKey = ""; // 清空排序欄位
                    this.sortOrder = 0; 
                }
            } else {
                // 如果點擊的是新欄位 -> 狀態 1 (預設降冪)
                this.sortKey = key;
                this.sortOrder = -1; 
            }
        },
        // 顯示排序圖示
        getSortIcon(key) {
            if (this.sortKey !== key) return '⬍';
            return this.sortOrder === 1 ? '▲' : '▼';
        },
        // 重置所有篩選
        resetFilters() {
            this.selectedRegion = "";
            this.selectedVillage = "";
            this.selectedUsage = "";
        }
    },
    mounted() {
        this.loadCSV();
    }
}).mount('#app');