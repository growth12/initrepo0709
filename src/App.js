import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, ShoppingCart, Star, Filter, BarChart3, Package, RefreshCw } from 'lucide-react';

function App() {
    const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

    // 상태 관리
    const [items, setItems] = useState([]);
    const [statistics, setStatistics] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [sortBy, setSortBy] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');
    const [activeTab, setActiveTab] = useState('items');
    const [showAddForm, setShowAddForm] = useState(false);
    
    // 폼 상태
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: 0,
        category: '전자제품',
        stock_count: 0,
        tags: '',
        image_url: ''
    });

    const [editingItem, setEditingItem] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    // 알림 표시 함수
    const showNotification = (message, type = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    // 초기 데이터 로드
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchItems(),
                fetchStatistics(),
                fetchCategories()
            ]);
        } catch (error) {
            showNotification('데이터 로드 중 오류가 발생했습니다', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        try {
            const params = new URLSearchParams({
                ...(selectedCategory && { category: selectedCategory }),
                sort_by: sortBy,
                order: sortOrder
            });
            
            const response = await fetch(`${API_BASE_URL}/items?${params}`);
            const data = await response.json();
            setItems(data);
        } catch (error) {
            console.error('아이템 조회 오류:', error);
        }
    };

    const fetchStatistics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/statistics`);
            const data = await response.json();
            setStatistics(data);
        } catch (error) {
            console.error('통계 조회 오류:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            const data = await response.json();
            setCategories(data.categories);
        } catch (error) {
            console.error('카테고리 조회 오류:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchItems();
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
            const data = await response.json();
            setItems(data);
        } catch (error) {
            showNotification('검색 중 오류가 발생했습니다', 'error');
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const itemData = {
                ...newItem,
                price: parseFloat(newItem.price),
                stock_count: parseInt(newItem.stock_count),
                tags: newItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };
            
            const response = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            
            if (response.ok) {
                showNotification('아이템이 성공적으로 추가되었습니다', 'success');
                setNewItem({ name: '', description: '', price: 0, category: '전자제품', stock_count: 0, tags: '', image_url: '' });
                setShowAddForm(false);
                loadData();
            }
        } catch (error) {
            showNotification('아이템 추가 중 오류가 발생했습니다', 'error');
        }
    };

    const handleUpdateItem = async (e) => {
        e.preventDefault();
        try {
            const itemData = {
                ...editingItem,
                price: parseFloat(editingItem.price),
                stock_count: parseInt(editingItem.stock_count),
                tags: editingItem.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };
            
            const response = await fetch(`${API_BASE_URL}/items/${editingItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(itemData)
            });
            
            if (response.ok) {
                showNotification('아이템이 성공적으로 수정되었습니다', 'success');
                setEditingItem(null);
                loadData();
            }
        } catch (error) {
            showNotification('아이템 수정 중 오류가 발생했습니다', 'error');
        }
    };

    const handleDeleteItem = async (id, name) => {
        if (!window.confirm(`정말로 '${name}' 아이템을 삭제하시겠습니까?`)) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/items/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                showNotification('아이템이 성공적으로 삭제되었습니다', 'success');
                loadData();
            }
        } catch (error) {
            showNotification('아이템 삭제 중 오류가 발생했습니다', 'error');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
    };

    const getStarRating = (rating) => {
        return (
            <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                ))}
                <span className="ml-1 text-sm text-gray-600">{rating}</span>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
            {/* 헤더 */}
            <header className="bg-white shadow-lg border-b border-purple-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <ShoppingCart className="h-8 w-8 text-purple-600 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-900">Enhanced 쇼핑몰</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={loadData}
                                disabled={loading}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                새로고침
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* 알림 */}
            {notification.message && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                    notification.type === 'success' ? 'bg-green-500' : 
                    notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                } text-white`}>
                    {notification.message}
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 탭 네비게이션 */}
                <div className="mb-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'items', label: '상품 목록', icon: Package },
                            { id: 'statistics', label: '통계', icon: BarChart3 }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                                    activeTab === id 
                                        ? 'bg-purple-600 text-white shadow-lg' 
                                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                                }`}
                            >
                                <Icon className="w-5 h-5 mr-2" />
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 통계 대시보드 */}
                {activeTab === 'statistics' && statistics && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">총 상품 수</h3>
                            <p className="text-3xl font-bold text-purple-600">{statistics.total_items}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">판매 중인 상품</h3>
                            <p className="text-3xl font-bold text-green-600">{statistics.available_items}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">총 재고 가치</h3>
                            <p className="text-3xl font-bold text-blue-600">{formatPrice(statistics.total_value)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-100">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">평균 가격</h3>
                            <p className="text-3xl font-bold text-orange-600">{formatPrice(statistics.avg_price)}</p>
                        </div>
                    </div>
                )}

                {/* 상품 목록 탭 */}
                {activeTab === 'items' && (
                    <>
                        {/* 검색 및 필터 */}
                        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-purple-100">
                            <div className="flex flex-col lg:flex-row gap-4 items-center">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="상품명, 설명, 태그로 검색..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                
                                <div className="flex items-center space-x-4">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">모든 카테고리</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                    
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="id">ID순</option>
                                        <option value="name">이름순</option>
                                        <option value="price">가격순</option>
                                        <option value="rating">평점순</option>
                                    </select>
                                    
                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        {sortOrder === 'asc' ? '↑' : '↓'}
                                    </button>
                                    
                                    <button
                                        onClick={handleSearch}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                    >
                                        검색
                                    </button>
                                    
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        상품 추가
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 상품 그리드 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {items.map(item => (
                                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-purple-100">
                                    <div className="relative">
                                        <img
                                            src={item.image_url || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'}
                                            alt={item.name}
                                            className="w-full h-48 object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop';
                                            }}
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                                                {item.category}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {item.is_available ? '판매중' : '품절'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-gray-900 mb-2 truncate">{item.name}</h3>
                                        <p className="text-gray-600 text-sm mb-3 h-10 overflow-hidden">{item.description}</p>
                                        
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-2xl font-bold text-purple-600">{formatPrice(item.price)}</span>
                                            {getStarRating(item.rating)}
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm text-gray-500">재고: {item.stock_count}개</span>
                                            <span className="text-sm text-gray-500">ID: {item.id}</span>
                                        </div>
                                        
                                        {item.tags && item.tags.length > 0 && (
                                            <div className="mb-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.tags.slice(0, 3).map((tag, index) => (
                                                        <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setEditingItem({
                                                    ...item,
                                                    tags: item.tags ? item.tags.join(', ') : ''
                                                })}
                                                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDeleteItem(item.id, item.name)}
                                                className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                삭제
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {items.length === 0 && !loading && (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg">표시할 상품이 없습니다.</p>
                            </div>
                        )}
                    </>
                )}

                {/* 상품 추가 모달 */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">새 상품 추가</h2>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                                    <input
                                        type="text"
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                                    <textarea
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        rows="3"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                                        <input
                                            type="number"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
                                        <input
                                            type="number"
                                            value={newItem.stock_count}
                                            onChange={(e) => setNewItem({...newItem, stock_count: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                    <select
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="전자제품">전자제품</option>
                                        <option value="의류">의류</option>
                                        <option value="신발">신발</option>
                                        <option value="음료">음료</option>
                                        <option value="기타">기타</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
                                    <input
                                        type="text"
                                        value={newItem.tags}
                                        onChange={(e) => setNewItem({...newItem, tags: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        placeholder="예: 스마트폰, 삼성, 안드로이드"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                                    <input
                                        type="url"
                                        value={newItem.image_url}
                                        onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        추가
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        취소
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 상품 수정 모달 */}
                {editingItem && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold mb-4">상품 수정</h2>
                            <form onSubmit={handleUpdateItem} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                                    <input
                                        type="text"
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                                    <textarea
                                        value={editingItem.description}
                                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        rows="3"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                                        <input
                                            type="number"
                                            value={editingItem.price}
                                            onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            required
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
                                        <input
                                            type="number"
                                            value={editingItem.stock_count}
                                            onChange={(e) => setEditingItem({...editingItem, stock_count: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                    <select
                                        value={editingItem.category}
                                        onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="전자제품">전자제품</option>
                                        <option value="의류">의류</option>
                                        <option value="신발">신발</option>
                                        <option value="음료">음료</option>
                                        <option value="기타">기타</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">태그 (쉼표로 구분)</label>
                                    <input
                                        type="text"
                                        value={editingItem.tags}
                                        onChange={(e) => setEditingItem({...editingItem, tags: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        placeholder="예: 스마트폰, 삼성, 안드로이드"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">이미지 URL</label>
                                    <input
                                        type="url"
                                        value={editingItem.image_url}
                                        onChange={(e) => setEditingItem({...editingItem, image_url: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_available"
                                        checked={editingItem.is_available}
                                        onChange={(e) => setEditingItem({...editingItem, is_available: e.target.checked})}
                                        className="mr-2"
                                    />
                                    <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
                                        판매 가능
                                    </label>
                                </div>
                                
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        수정
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(null)}
                                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        취소
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 로딩 스피너 */}
                {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-xl">
                            <div className="flex items-center">
                                <RefreshCw className="w-6 h-6 text-purple-600 animate-spin mr-3" />
                                <span className="text-lg font-medium">로딩 중...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;