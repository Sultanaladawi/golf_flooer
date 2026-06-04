"use client";

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Shirt, 
  ClipboardList, 
  Plus, 
  Trash2, 
  Edit, 
  X, 
  Eye, 
  AlertCircle
} from 'lucide-react';
import { useAppContext, type Order } from '../context/AppContext';
import { type ProductModel } from '../data/models';
import styles from './page.module.css';

type Tab = 'overview' | 'products' | 'orders';

export default function AdminDashboard() {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    orders, 
    updateOrderStatus, 
    currency 
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductModel | null>(null);

  // Form states for Product CRUD
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState('');
  const [badge, setBadge] = useState('');
  const [category, setCategory] = useState<'classic' | 'occassions' | 'winter' | 'new'>('classic');
  const [imageInput, setImageInput] = useState(''); // comma-separated URLs or single
  const [videoInput, setVideoInput] = useState(''); // comma-separated URLs or single
  
  // Fabric details
  const [fabricType, setFabricType] = useState('');
  const [embroidery, setEmbroidery] = useState('');
  const [lining, setLining] = useState('');
  const [color, setColor] = useState('');
  const [weight, setWeight] = useState('');
  const [origin, setOrigin] = useState('');

  // Sizes & Care
  const [sizesInput, setSizesInput] = useState('S,M,L,XL,XXL,3XL');
  const [careInput, setCareInput] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSubtitle('');
    setPrice('');
    setBadge('');
    setCategory('classic');
    setImageInput('');
    setVideoInput('');
    setFabricType('كريب مزدوج فاخر');
    setEmbroidery('تطريز يدوي بخيط ذهبي');
    setLining('حرير صناعي ناعم');
    setColor('أسود فاحم');
    setWeight('خفيف');
    setOrigin('مصنوع يدوياً في الأردن');
    setSizesInput('S,M,L,XL,XXL,3XL');
    setCareInput('غسيل يدوي فقط\nلا تستخدمي المجفف\nكي على حرارة منخفضة');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: ProductModel) => {
    setEditingProduct(prod);
    setName(prod.name);
    setSubtitle(prod.subtitle);
    setPrice(prod.price);
    setBadge(prod.badge || '');
    setCategory(prod.category);
    setImageInput(prod.images.join(', '));
    setVideoInput(prod.videos.join(', '));
    
    // Parse fabric array
    const getFabricVal = (lbl: string) => prod.fabric.find(f => f.label === lbl)?.value || '';
    setFabricType(getFabricVal('نوع القماش'));
    setEmbroidery(getFabricVal('التطريز'));
    setLining(getFabricVal('البطانة'));
    setColor(getFabricVal('اللون'));
    setWeight(getFabricVal('الوزن'));
    setOrigin(getFabricVal('بلد المنشأ'));

    setSizesInput(prod.sizes.join(','));
    setCareInput(prod.care.join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedImages = imageInput.split(',')
      .map(img => img.trim())
      .filter(img => img !== '');
    
    const parsedVideos = videoInput.split(',')
      .map(vid => vid.trim())
      .filter(vid => vid !== '');

    const fabricArray = [
      { label: 'نوع القماش', value: fabricType },
      { label: 'التطريز', value: embroidery },
      { label: 'البطانة', value: lining },
      { label: 'اللون', value: color },
      { label: 'الوزن', value: weight },
      { label: 'بلد المنشأ', value: origin }
    ];

    const parsedSizes = sizesInput.split(',')
      .map(s => s.trim())
      .filter(s => s !== '');

    const parsedCare = careInput.split('\n')
      .map(c => c.trim())
      .filter(c => c !== '');

    const productData = {
      name,
      subtitle,
      price,
      badge: badge.trim() === '' ? null : badge,
      category,
      images: parsedImages.length > 0 ? parsedImages : ['/12.png'],
      videos: parsedVideos,
      fabric: fabricArray,
      sizes: parsedSizes,
      care: parsedCare
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, { ...productData, id: editingProduct.id });
    } else {
      addProduct(productData);
    }
    
    setIsModalOpen(false);
  };

  const getPriceSymbol = () => {
    switch (currency) {
      case 'SAR': return 'ر.س';
      case 'AED': return 'د.إ';
      default: return 'د.أ';
    }
  };

  const getCurrencyMultiplier = () => {
    switch (currency) {
      case 'SAR': return 5.3;
      case 'AED': return 5.2;
      default: return 1.0;
    }
  };

  const multiplier = getCurrencyMultiplier();

  // OVERVIEW CALCULATIONS
  const completedOrders = orders.filter(o => o.status === 'مكتمل');
  const revenueTotal = completedOrders.reduce((sum, o) => sum + o.total, 0) * multiplier;
  const activeOrdersCount = orders.filter(o => o.status === 'قيد التجهيز' || o.status === 'تم الشحن').length;

  return (
    <div className={styles.adminContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>لوحة الإدارة</div>
        <nav style={{ flex: 1 }}>
          <button 
            className={`${styles.navItem} ${activeTab === 'overview' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={18} />
            <span>نظرة عامة</span>
          </button>
          
          <button 
            className={`${styles.navItem} ${activeTab === 'products' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <Shirt size={18} />
            <span>إدارة المنتجات</span>
          </button>
          
          <button 
            className={`${styles.navItem} ${activeTab === 'orders' ? styles.navItemActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ClipboardList size={18} />
            <span>إدارة الطلبات ({orders.length})</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <header className={styles.header}>
              <h1 className={styles.pageTitle}>ملخص أداء المتجر</h1>
            </header>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3 className={styles.statTitle}>المبيعات المكتملة</h3>
                <div className={styles.statValue}>
                  {revenueTotal.toFixed(1)} {getPriceSymbol()}
                </div>
              </div>
              <div className={styles.statCard}>
                <h3 className={styles.statTitle}>طلبات قيد المتابعة</h3>
                <div className={styles.statValue}>{activeOrdersCount}</div>
              </div>
              <div className={styles.statCard}>
                <h3 className={styles.statTitle}>المنتجات النشطة</h3>
                <div className={styles.statValue}>{products.length}</div>
              </div>
              <div className={styles.statCard}>
                <h3 className={styles.statTitle}>إجمالي الطلبات</h3>
                <div className={styles.statValue}>{orders.length}</div>
              </div>
            </div>

            {/* Quick Orders List */}
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>آخر الطلبات الواردة</h2>
              </div>
              
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>رقم الطلب</th>
                      <th>اسم العميل</th>
                      <th>التاريخ</th>
                      <th>العنوان</th>
                      <th>الإجمالي</th>
                      <th>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((ord) => (
                      <tr key={ord.id}>
                        <td><strong>{ord.id}</strong></td>
                        <td>{ord.customer}</td>
                        <td>{new Date(ord.date).toLocaleDateString('ar-JO')}</td>
                        <td>{ord.city} — {ord.address.slice(0, 20)}...</td>
                        <td>{(ord.total * multiplier).toFixed(1)} {getPriceSymbol()}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${
                            ord.status === 'مكتمل' ? styles['status-completed'] :
                            ord.status === 'قيد التجهيز' ? styles['status-pending'] :
                            ord.status === 'تم الشحن' ? styles['status-shipped'] : styles['status-cancelled']
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div>
            <header className={styles.header}>
              <h1 className={styles.pageTitle}>إدارة العبايات المعروضة</h1>
              <button className="btn-primary" onClick={openAddModal}>
                إضافة منتج جديد +
              </button>
            </header>

            <div className={styles.panelCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>الصورة</th>
                      <th>اسم الموديل</th>
                      <th>الوصف الجانبي</th>
                      <th>السعر</th>
                      <th>التصنيف</th>
                      <th>الشارات</th>
                      <th>عمليات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <img 
                            src={prod.images.length > 0 ? prod.images[0] : '/12.png'} 
                            alt={prod.name} 
                            className={styles.productThumb} 
                          />
                        </td>
                        <td><strong>{prod.name}</strong></td>
                        <td>{prod.subtitle}</td>
                        <td>{prod.price}</td>
                        <td>
                          <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>
                            {prod.category === 'classic' ? 'كلاسيك' :
                             prod.category === 'occassions' ? 'مناسبات' :
                             prod.category === 'winter' ? 'شتوية' : 'جديد'}
                          </span>
                        </td>
                        <td>{prod.badge || '-'}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button 
                              className={styles.editBtn} 
                              onClick={() => openEditModal(prod)}
                            >
                              <Edit size={14} /> تعديل
                            </button>
                            <button 
                              className={styles.deleteBtn} 
                              onClick={() => deleteProduct(prod.id)}
                            >
                              <Trash2 size={14} /> حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div>
            <header className={styles.header}>
              <h1 className={styles.pageTitle}>متابعة طلبات العملاء</h1>
            </header>

            <div className={styles.panelCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>رقم الطلب</th>
                      <th>معلومات العميل</th>
                      <th>المنتجات والكمية</th>
                      <th>التاريخ</th>
                      <th>المجموع</th>
                      <th>تحديث الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td><strong>{ord.id}</strong></td>
                        <td>
                          <div><strong>{ord.customer}</strong></div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>الهاتف: {ord.phone}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>العنوان: {ord.city} - {ord.address}</div>
                        </td>
                        <td>
                          {ord.items.map((item, i) => (
                            <div key={i} className={styles.orderItemRow}>
                              ✦ {item.name} (عدد {item.quantity})
                            </div>
                          ))}
                        </td>
                        <td>{new Date(ord.date).toLocaleDateString('ar-JO')}</td>
                        <td>{(ord.total * multiplier).toFixed(1)} {getPriceSymbol()}</td>
                        <td>
                          <select 
                            className={styles.statusSelect}
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as Order['status'])}
                          >
                            <option value="قيد التجهيز">قيد التجهيز</option>
                            <option value="تم الشحن">تم الشحن</option>
                            <option value="مكتمل">مكتمل</option>
                            <option value="ملغي">ملغي</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===== EDIT/CREATE MODAL ===== */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>
              <X size={24} />
            </button>
            <h2 className={styles.panelTitle} style={{ marginBottom: '1.5rem' }}>
              {editingProduct ? `تعديل الموديل: ${editingProduct.name}` : 'إضافة عباية جديدة'}
            </h2>

            <form onSubmit={handleSaveProduct}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>اسم العباية *</label>
                  <input 
                    type="text" 
                    required 
                    className={styles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>الوصف الجانبي (العنوان الفرعي) *</label>
                  <input 
                    type="text" 
                    required 
                    className={styles.input}
                    placeholder="مثال: تطريز يدوي فاخر"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>السعر (نصي) *</label>
                  <input 
                    type="text" 
                    required 
                    className={styles.input}
                    placeholder="مثال: 95 د.أ"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>التصنيف *</label>
                  <select 
                    className={styles.input}
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                  >
                    <option value="classic">كلاسيك</option>
                    <option value="occassions">مناسبات</option>
                    <option value="winter">شتوية</option>
                    <option value="new">وصل حديثاً</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>الشارة الخاصة (أو اترك فارغاً)</label>
                  <input 
                    type="text" 
                    className={styles.input}
                    placeholder="مثال: الأكثر مبيعاً، جديد، حصري"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>المقاسات المتوفرة (مفصولة بفاصلة) *</label>
                  <input 
                    type="text" 
                    required 
                    className={styles.input}
                    placeholder="S,M,L,XL"
                    value={sizesInput}
                    onChange={(e) => setSizesInput(e.target.value)}
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>روابط الصور (مفصولة بفاصلة) *</label>
                  <input 
                    type="text" 
                    required 
                    className={styles.input}
                    placeholder="/8.png, /8 (1).png"
                    value={imageInput}
                    onChange={(e) => setImageInput(e.target.value)}
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>روابط الفيديو (مفصولة بفاصلة، اختيارية)</label>
                  <input 
                    type="text" 
                    className={styles.input}
                    placeholder="/8.mp4"
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                  />
                </div>

                {/* Fabric Parameters */}
                <h3 className={styles.formGroupFull} style={{ fontFamily: 'var(--font-serif)', margin: '1rem 0 0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>مواصفات القماش</h3>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>نوع القماش</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={fabricType}
                    onChange={(e) => setFabricType(e.target.value)}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>التطريز</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={embroidery}
                    onChange={(e) => setEmbroidery(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>البطانة</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={lining}
                    onChange={(e) => setLining(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>اللون</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>الوزن</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>بلد المنشأ</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>

                <div className={styles.formGroupFull}>
                  <label className={styles.label}>تعليمات العناية (كل سطر تعليمة مستقلة)</label>
                  <textarea 
                    className={styles.input}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={careInput}
                    onChange={(e) => setCareInput(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.modalActions}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  <span>إلغاء</span>
                </button>
                <button type="submit" className="btn-primary">
                  حفظ المنتج
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
