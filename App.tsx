import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, AlertTriangle, Search, Plus, Minus, X } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  quantity: number;
  category: string;
  minStock?: number;
  criticalStock?: number;
}

interface Operation {
  id: string;
  timestamp: Date;
  type: 'incoming' | 'writeoff';
  componentName: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  status: 'success' | 'error';
  note?: string;
}

interface Recipe {
  id: string;
  component: string;
  product: string;
  norm: number;
}

export default function WarehouseApp() {
  const [components, setComponents] = useState<Component[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeTab, setActiveTab] = useState<'warehouse' | 'recipes' | 'planning' | 'operations'>('warehouse');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Инициализация данных
  useEffect(() => {
    const initialComponents: Component[] = [
      { id: '1', name: 'Резистор 10кОм', quantity: 1000, category: 'Резисторы', minStock: 100, criticalStock: 50 },
      { id: '2', name: 'Конденсатор 100нФ', quantity: 500, category: 'Конденсаторы', minStock: 200, criticalStock: 100 },
      { id: '3', name: 'Микроконтроллер ATmega328', quantity: 50, category: 'Микросхемы', minStock: 20, criticalStock: 10 },
      { id: '4', name: 'Светодиод красный 5мм', quantity: 200, category: 'Светодиоды', minStock: 100, criticalStock: 50 },
      { id: '5', name: 'Транзистор BC547', quantity: 300, category: 'Транзисторы', minStock: 150, criticalStock: 75 },
    ];

    const initialRecipes: Recipe[] = [
      { id: '1', component: 'Резистор 10кОм', product: 'Arduino Uno', norm: 2 },
      { id: '2', component: 'Конденсатор 100нФ', product: 'Arduino Uno', norm: 4 },
      { id: '3', component: 'Микроконтроллер ATmega328', product: 'Arduino Uno', norm: 1 },
      { id: '4', component: 'Светодиод красный 5мм', product: 'Arduino Uno', norm: 1 },
    ];

    setComponents(initialComponents);
    setRecipes(initialRecipes);
  }, []);

  // Фильтрация компонентов
  const filteredComponents = components.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Получение уникальных категорий
  const categories = ['all', ...Array.from(new Set(components.map(c => c.category)))];

  // Проверка критических остатков
  const criticalComponents = components.filter(comp => 
    comp.criticalStock && comp.quantity <= comp.criticalStock
  );

  const lowStockComponents = components.filter(comp => 
    comp.minStock && comp.quantity <= comp.minStock && comp.quantity > (comp.criticalStock || 0)
  );

  // Обработка массовых операций
  const handleBatchOperation = (type: 'incoming' | 'writeoff', items: Array<{name: string, quantity: number}>) => {
    const newOperations: Operation[] = [];
    
    items.forEach(item => {
      const componentIndex = components.findIndex(c => c.name === item.name);
      if (componentIndex === -1 && type === 'writeoff') {
        alert(`Компонент "${item.name}" не найден для списания`);
        return;
      }

      let updatedComponents = [...components];
      let stockBefore = 0;
      let stockAfter = 0;

      if (componentIndex !== -1) {
        stockBefore = updatedComponents[componentIndex].quantity;
        
        if (type === 'incoming') {
          stockAfter = stockBefore + item.quantity;
          updatedComponents[componentIndex].quantity = stockAfter;
        } else {
          if (stockBefore < item.quantity) {
            alert(`Недостаточно "${item.name}". Доступно: ${stockBefore}, запрошено: ${item.quantity}`);
            return;
          }
          stockAfter = stockBefore - item.quantity;
          updatedComponents[componentIndex].quantity = stockAfter;
        }
      } else if (type === 'incoming') {
        // Создаем новый компонент
        const newComponent: Component = {
          id: Date.now().toString(),
          name: item.name,
          quantity: item.quantity,
          category: 'Разное'
        };
        updatedComponents.push(newComponent);
        stockBefore = 0;
        stockAfter = item.quantity;
      }

      setComponents(updatedComponents);

      const operation: Operation = {
        id: `OP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        type,
        componentName: item.name,
        quantity: item.quantity,
        stockBefore,
        stockAfter,
        status: 'success'
      };

      newOperations.push(operation);
    });

    setOperations(prev => [...newOperations, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛠️ Управление складом SMD</h1>
          <p className="text-gray-600">Система учёта электронных компонентов</p>
        </div>

        {/* Alerts */}
        {(criticalComponents.length > 0 || lowStockComponents.length > 0) && (
          <div className="mb-6 space-y-2">
            {criticalComponents.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="font-semibold text-red-800">
                    Критический остаток: {criticalComponents.length} компонентов
                  </span>
                </div>
                <div className="mt-2 text-sm text-red-700">
                  {criticalComponents.map(c => `${c.name}: ${c.quantity} шт`).join(', ')}
                </div>
              </div>
            )}
            
            {lowStockComponents.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-semibold text-yellow-800">
                    Низкий остаток: {lowStockComponents.length} компонентов
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'warehouse', label: '📦 Склад', icon: Package },
              { id: 'recipes', label: '📋 Рецептура', icon: TrendingUp },
              { id: 'planning', label: '📅 Планирование', icon: TrendingUp },
              { id: 'operations', label: '🔄 Операции', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'warehouse' && (
          <WarehouseTab 
            components={filteredComponents}
            categories={categories}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onBatchOperation={handleBatchOperation}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipesTab recipes={recipes} components={components} />
        )}

        {activeTab === 'planning' && (
          <PlanningTab recipes={recipes} components={components} />
        )}

        {activeTab === 'operations' && (
          <OperationsTab operations={operations} />
        )}
      </div>
    </div>
  );
}

// Компонент вкладки склада
function WarehouseTab({ 
  components, 
  categories, 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory,
  onBatchOperation 
}: {
  components: Component[];
  categories: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onBatchOperation: (type: 'incoming' | 'writeoff', items: Array<{name: string, quantity: number}>) => void;
}) {
  const [showBatchDialog, setShowBatchDialog] = useState(false);
  const [batchItems, setBatchItems] = useState<Array<{name: string, quantity: number}>>([{name: '', quantity: 1}]);
  const [operationType, setOperationType] = useState<'incoming' | 'writeoff'>('incoming');

  const addBatchItem = () => {
    setBatchItems([...batchItems, {name: '', quantity: 1}]);
  };

  const removeBatchItem = (index: number) => {
    setBatchItems(batchItems.filter((_, i) => i !== index));
  };

  const updateBatchItem = (index: number, field: 'name' | 'quantity', value: string | number) => {
    const updated = [...batchItems];
    updated[index] = { ...updated[index], [field]: value };
    setBatchItems(updated);
  };

  const executeBatchOperation = () => {
    const validItems = batchItems.filter(item => item.name && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Добавьте хотя бы один компонент');
      return;
    }
    
    onBatchOperation(operationType, validItems);
    setShowBatchDialog(false);
    setBatchItems([{name: '', quantity: 1}]);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Поиск и фильтрация
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Поиск компонента
            </label>
            <input
              id="search"
              type="text"
              placeholder="Введите название..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'Все категории' : cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => setShowBatchDialog(true)}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              📥📤 Массовые операции
            </button>
          </div>
        </div>
      </div>

      {/* Components Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">
          Компоненты на складе ({components.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Наименование</th>
                <th className="text-left p-2">Категория</th>
                <th className="text-right p-2">Остаток</th>
                <th className="text-right p-2">Мин. остаток</th>
                <th className="text-center p-2">Статус</th>
              </tr>
            </thead>
            <tbody>
              {components.map(comp => (
                <tr key={comp.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{comp.name}</td>
                  <td className="p-2 text-gray-600">{comp.category}</td>
                  <td className="p-2 text-right font-mono">{comp.quantity}</td>
                  <td className="p-2 text-right text-gray-600">{comp.minStock || '-'}</td>
                  <td className="p-2 text-center">
                    {comp.criticalStock && comp.quantity <= comp.criticalStock && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Критично
                      </span>
                    )}
                    {comp.minStock && comp.quantity <= comp.minStock && comp.quantity > (comp.criticalStock || 0) && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        Низкий
                      </span>
                    )}
                    {(!comp.minStock || comp.quantity > comp.minStock) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Норма
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Batch Operation Dialog */}
      {showBatchDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">📥📤 Массовые операции</h3>
              
              <div className="mb-4">
                <label htmlFor="operationType" className="block text-sm font-medium text-gray-700 mb-1">
                  Тип операции
                </label>
                <select
                  id="operationType"
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value as 'incoming' | 'writeoff')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="incoming">📥 Оприходование</option>
                  <option value="writeoff">📤 Списание</option>
                </select>
              </div>

              <div className="space-y-3 mb-4">
                {batchItems.map((item, index) => (
                  <div key={index} className="flex space-x-2 items-end p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Компонент
                      </label>
                      <input
                        type="text"
                        placeholder="Название компонента"
                        value={item.name}
                        onChange={(e) => updateBatchItem(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Количество
                      </label>
                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={item.quantity}
                        onChange={(e) => updateBatchItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={() => removeBatchItem(index)}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <button onClick={addBatchItem} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить компонент
                </button>
                <button onClick={executeBatchOperation} className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                  ✅ Выполнить операции
                </button>
                <button onClick={() => setShowBatchDialog(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  ❌ Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Компонент вкладки рецептуры
function RecipesTab({ recipes, components }: { recipes: Recipe[], components: Component[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">📋 Рецептура изделий</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Компонент</th>
              <th className="text-left p-2">Изделие</th>
              <th className="text-right p-2">Норма</th>
              <th className="text-right p-2">Остаток на складе</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map(recipe => {
              const component = components.find(c => c.name === recipe.component);
              return (
                <tr key={recipe.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{recipe.component}</td>
                  <td className="p-2">{recipe.product}</td>
                  <td className="p-2 text-right font-mono">{recipe.norm}</td>
                  <td className="p-2 text-right font-mono">
                    {component ? component.quantity : 'Не найден'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Компонент вкладки планирования
function PlanningTab({ recipes, components }: { recipes: Recipe[], components: Component[] }) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [planQuantity, setPlanQuantity] = useState(1);
  const [calculation, setCalculation] = useState<any[]>([]);

  const products = Array.from(new Set(recipes.map(r => r.product)));

  const calculateDemand = () => {
    if (!selectedProduct || planQuantity <= 0) return;

    const productRecipes = recipes.filter(r => r.product === selectedProduct);
    const result = productRecipes.map(recipe => {
      const component = components.find(c => c.name === recipe.component);
      const required = recipe.norm * planQuantity;
      const stock = component ? component.quantity : 0;
      const shortage = required > stock ? required - stock : 0;

      return {
        component: recipe.component,
        norm: recipe.norm,
        required,
        stock,
        shortage
      };
    });

    setCalculation(result);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">📅 Планирование производства</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
              Изделие
            </label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Выберите изделие</option>
              {products.map(product => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              План выпуска (шт)
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={planQuantity}
              onChange={(e) => setPlanQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button onClick={calculateDemand} className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              🧾 Рассчитать
            </button>
          </div>
        </div>

        {calculation.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-3">Результат расчёта:</h4>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Компонент</th>
                    <th className="text-right p-2">Норма</th>
                    <th className="text-right p-2">Нужно</th>
                    <th className="text-right p-2">Остаток</th>
                    <th className="text-right p-2">Нехватка</th>
                  </tr>
                </thead>
                <tbody>
                  {calculation.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{item.component}</td>
                      <td className="p-2 text-right font-mono">{item.norm}</td>
                      <td className="p-2 text-right font-mono">{item.required}</td>
                      <td className="p-2 text-right font-mono">{item.stock}</td>
                      <td className={`p-2 text-right font-mono ${item.shortage > 0 ? 'text-red-600 font-bold' : ''}`}>
                        {item.shortage > 0 ? item.shortage : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {calculation.some(item => item.shortage > 0) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-semibold">
                  ⚠️ Внимание: есть нехватка компонентов!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент вкладки операций
function OperationsTab({ operations }: { operations: Operation[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">🔄 История операций</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Дата/время</th>
              <th className="text-left p-2">Тип</th>
              <th className="text-left p-2">Компонент</th>
              <th className="text-right p-2">Количество</th>
              <th className="text-right p-2">Остаток до</th>
              <th className="text-right p-2">Остаток после</th>
              <th className="text-center p-2">Статус</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => (
              <tr key={op.id} className="border-b hover:bg-gray-50">
                <td className="p-2 font-mono text-sm">{op.id}</td>
                <td className="p-2 text-sm">{new Date(op.timestamp).toLocaleString()}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    op.type === 'incoming' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {op.type === 'incoming' ? '📥 Приход' : '📤 Списание'}
                  </span>
                </td>
                <td className="p-2 font-medium">{op.componentName}</td>
                <td className="p-2 text-right font-mono">{op.quantity}</td>
                <td className="p-2 text-right font-mono">{op.stockBefore}</td>
                <td className="p-2 text-right font-mono">{op.stockAfter}</td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    op.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {op.status === 'success' ? '✅ Успешно' : '❌ Ошибка'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}