import React, { useState, useEffect } from 'react';
import './App.css'; // 기본 CSS 파일을 활용하거나 직접 작성하세요.

function App() {
    // FastAPI 백엔드 서버의 주소를 여기에 입력하세요.
    const API_BASE_URL = process.env.REACT_APP_API_URL;

    // 상태 관리
    const [serverMessage, setServerMessage] = useState('');
    const [healthStatus, setHealthStatus] = useState('');
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState({ name: '', description: '', price: 0, is_available: true });
    const [createStatus, setCreateStatus] = useState('');
    const [fetchItemsStatus, setFetchItemsStatus] = useState('');
    const [specificItemId, setSpecificItemId] = useState('');
    const [specificItemResult, setSpecificItemResult] = useState(null);
    const [specificItemStatus, setSpecificItemStatus] = useState('');
    const [updateItemData, setUpdateItemData] = useState({ id: '', name: '', description: '', price: 0, is_available: true });
    const [updateStatus, setUpdateStatus] = useState('');
    const [deleteItemId, setDeleteItemId] = useState('');
    const [deleteStatus, setDeleteStatus] = useState('');

    // 초기 로딩 시 서버 상태 및 아이템 목록 가져오기
    useEffect(() => {
        checkServerStatus();
        getAllItems();
    }, []);

    // 서버 상태 및 루트 메시지 확인
    const checkServerStatus = async () => {
        try {
            const rootResponse = await fetch(`${API_BASE_URL}/`);
            const rootData = await rootResponse.json();
            setServerMessage(rootData.message);

            const healthResponse = await fetch(`${API_BASE_URL}/health`);
            const healthData = await healthResponse.json();
            setHealthStatus(`${healthData.status} - ${healthData.message}`);
        } catch (error) {
            setServerMessage(`서버 연결 오류: ${error.message}`);
            setHealthStatus('오류 발생');
            console.error('Server status check error:', error);
        }
    };

    // 모든 아이템 조회
    const getAllItems = async () => {
        setFetchItemsStatus('로딩 중...');
        try {
            const response = await fetch(`${API_BASE_URL}/items`);
            if (!response.ok) {
                throw new Error('아이템 목록을 가져오지 못했습니다.');
            }
            const data = await response.json();
            setItems(data);
            setFetchItemsStatus('');
        } catch (error) {
            setFetchItemsStatus(`오류: ${error.message}`);
            console.error('Fetch items error:', error);
        }
    };

    // 새 아이템 생성 핸들러
    const handleCreateItemChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewItem(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const createItem = async (e) => {
        e.preventDefault();
        setCreateStatus('생성 중...');
        try {
            const response = await fetch(`${API_BASE_URL}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newItem,
                    price: parseFloat(newItem.price) // price는 숫자로 변환
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '아이템 생성 실패');
            }

            const createdItem = await response.json();
            setCreateStatus(`아이템 생성 성공: ID ${createdItem.id}, 이름: ${createdItem.name}`);
            setNewItem({ name: '', description: '', price: 0, is_available: true }); // 폼 초기화
            getAllItems(); // 목록 새로고침
        } catch (error) {
            setCreateStatus(`오류: ${error.message}`);
            console.error('Create item error:', error);
        }
    };

    // 특정 아이템 조회
    const getSpecificItem = async () => {
        setSpecificItemResult(null);
        setSpecificItemStatus('조회 중...');
        if (!specificItemId) {
            setSpecificItemStatus('아이템 ID를 입력해주세요.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/items/${specificItemId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '아이템을 찾을 수 없습니다.');
            }
            const data = await response.json();
            setSpecificItemResult(data);
            setSpecificItemStatus('');
        } catch (error) {
            setSpecificItemStatus(`오류: ${error.message}`);
            console.error('Get specific item error:', error);
        }
    };

    // 아이템 업데이트 핸들러
    const handleUpdateItemChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUpdateItemData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const updateItem = async (e) => {
        e.preventDefault();
        setUpdateStatus('업데이트 중...');
        if (!updateItemData.id) {
            setUpdateStatus('업데이트할 아이템 ID를 입력해주세요.');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/items/${updateItemData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: updateItemData.name,
                    description: updateItemData.description,
                    price: parseFloat(updateItemData.price),
                    is_available: updateItemData.is_available
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '아이템 업데이트 실패');
            }

            const updatedItem = await response.json();
            setUpdateStatus(`아이템 업데이트 성공: ID ${updatedItem.id}, 새 이름: ${updatedItem.name}`);
            setUpdateItemData({ id: '', name: '', description: '', price: 0, is_available: true }); // 폼 초기화
            getAllItems(); // 목록 새로고침
        } catch (error) {
            setUpdateStatus(`오류: ${error.message}`);
            console.error('Update item error:', error);
        }
    };

    // 아이템 삭제
    const deleteItem = async () => {
        setDeleteStatus('삭제 중...');
        if (!deleteItemId) {
            setDeleteStatus('삭제할 아이템 ID를 입력해주세요.');
            return;
        }

        if (!window.confirm(`정말로 아이템 ID ${deleteItemId}를 삭제하시겠습니까?`)) {
            setDeleteStatus('');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/items/${deleteItemId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '아이템 삭제 실패');
            }

            const result = await response.json();
            setDeleteStatus(`${result.message}`);
            setDeleteItemId(''); // 입력 필드 초기화
            getAllItems(); // 목록 새로고침
        } catch (error) {
            setDeleteStatus(`오류: ${error.message}`);
            console.error('Delete item error:', error);
        }
    };

    return (
        <div className="App">
            <h1>FastAPI & React 상호작용 예제</h1>

            {/* 서버 상태 확인 */}
            <div className="section">
                <h2>서버 상태 확인</h2>
                <button onClick={checkServerStatus}>서버 상태 확인</button>
                <p>루트 메시지: {serverMessage}</p>
                <p>헬스체크: {healthStatus}</p>
            </div>

            {/* 새 아이템 생성 */}
            <div className="section">
                <h2>새 아이템 생성</h2>
                <form onSubmit={createItem}>
                    <label>이름:</label>
                    <input type="text" name="name" value={newItem.name} onChange={handleCreateItemChange} required /><br />
                    <label>설명:</label>
                    <input type="text" name="description" value={newItem.description} onChange={handleCreateItemChange} /><br />
                    <label>가격:</label>
                    <input type="number" name="price" step="0.01" value={newItem.price} onChange={handleCreateItemChange} required /><br />
                    <label>사용 가능:</label>
                    <input type="checkbox" name="is_available" checked={newItem.is_available} onChange={handleCreateItemChange} /><br />
                    <button type="submit">아이템 생성</button>
                </form>
                <p className={createStatus.includes('성공') ? 'success' : 'error'}>{createStatus}</p>
            </div>

            {/* 모든 아이템 조회 */}
            <div className="section">
                <h2>모든 아이템 조회</h2>
                <button onClick={getAllItems}>아이템 목록 가져오기</button>
                <p>{fetchItemsStatus}</p>
                <div className="item-list">
                    {items.length === 0 && !fetchItemsStatus && <p>아이템이 없습니다.</p>}
                    {items.map(item => (
                        <div key={item.id} className="item-card">
                            <strong>ID: {item.id}</strong><br />
                            이름: {item.name}<br />
                            설명: {item.description || '없음'}<br />
                            가격: {item.price}<br />
                            사용 가능: {item.is_available ? '예' : '아니오'}
                        </div>
                    ))}
                </div>
            </div>

            {/* 특정 아이템 조회 */}
            <div className="section">
                <h2>특정 아이템 조회</h2>
                <label>아이템 ID:</label>
                <input type="number" value={specificItemId} onChange={(e) => setSpecificItemId(e.target.value)} placeholder="조회할 아이템 ID" /><br />
                <button onClick={getSpecificItem}>아이템 조회</button>
                <p className={specificItemStatus.includes('오류') ? 'error' : ''}>{specificItemStatus}</p>
                {specificItemResult && (
                    <div className="item-card">
                        <strong>ID: {specificItemResult.id}</strong><br />
                        이름: {specificItemResult.name}<br />
                        설명: {specificItemResult.description || '없음'}<br />
                        가격: {specificItemResult.price}<br />
                        사용 가능: {specificItemResult.is_available ? '예' : '아니오'}
                    </div>
                )}
            </div>

            {/* 아이템 업데이트 */}
            <div className="section">
                <h2>아이템 업데이트</h2>
                <form onSubmit={updateItem}>
                    <label>업데이트할 아이템 ID:</label>
                    <input type="number" name="id" value={updateItemData.id} onChange={handleUpdateItemChange} required /><br />
                    <label>새 이름:</label>
                    <input type="text" name="name" value={updateItemData.name} onChange={handleUpdateItemChange} required /><br />
                    <label>새 설명:</label>
                    <input type="text" name="description" value={updateItemData.description} onChange={handleUpdateItemChange} /><br />
                    <label>새 가격:</label>
                    <input type="number" name="price" step="0.01" value={updateItemData.price} onChange={handleUpdateItemChange} required /><br />
                    <label>사용 가능:</label>
                    <input type="checkbox" name="is_available" checked={updateItemData.is_available} onChange={handleUpdateItemChange} /><br />
                    <button type="submit">아이템 업데이트</button>
                </form>
                <p className={updateStatus.includes('성공') ? 'success' : 'error'}>{updateStatus}</p>
            </div>

            {/* 아이템 삭제 */}
            <div className="section">
                <h2>아이템 삭제</h2>
                <label>삭제할 아이템 ID:</label>
                <input type="number" value={deleteItemId} onChange={(e) => setDeleteItemId(e.target.value)} placeholder="삭제할 아이템 ID" /><br />
                <button onClick={deleteItem}>아이템 삭제</button>
                <p className={deleteStatus.includes('성공') ? 'success' : 'error'}>{deleteStatus}</p>
            </div>
        </div>
    );
}

export default App;