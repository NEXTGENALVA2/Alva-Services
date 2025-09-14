'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import axios from 'axios'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { MapPin, TrendingUp, Users, DollarSign } from 'lucide-react'

interface CustomerDistribution {
  division: string
  district: string
  count: number
  revenue: number
}

interface SalesData {
  date: string
  revenue: number
  orders: number
}

interface ProductSales {
  productName: string
  quantity: number
  revenue: number
  orders: number
}

export default function Analytics() {
  const [customerDistribution, setCustomerDistribution] = useState<CustomerDistribution[]>([])
  const [salesTrend, setSalesTrend] = useState<SalesData[]>([])
  const [topRegions, setTopRegions] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<ProductSales[]>([])
  const [loading, setLoading] = useState(true)

  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C']

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch customer distribution by region
      const distributionRes = await axios.get('http://localhost:5000/api/analytics/customer-distribution', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Fetch sales trend data
      const trendRes = await axios.get('http://localhost:5000/api/analytics/sales-trend', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Fetch top performing regions
      const regionsRes = await axios.get('http://localhost:5000/api/analytics/top-regions', {
        headers: { Authorization: `Bearer ${token}` }
      })

      // Fetch top selling products
      const productsRes = await axios.get('http://localhost:5000/api/analytics/top-products', {
        headers: { Authorization: `Bearer ${token}` }
      })

      setCustomerDistribution(distributionRes.data || [])
      setSalesTrend(trendRes.data || [])
      setTopRegions(regionsRes.data || [])
      setTopProducts(productsRes.data || [])
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSampleData = () => {
    // This function is removed - now we only use real data
  }

  // Group data by division for pie chart
  const divisionData = customerDistribution.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.division)
    if (existing) {
      existing.value += curr.count
      existing.revenue += curr.revenue
    } else {
      acc.push({
        name: curr.division,
        value: curr.count,
        revenue: curr.revenue
      })
    }
    return acc
  }, [] as any[])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">অ্যানালিটিক্স লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 অ্যানালিটিক্স</h1>
        <p className="text-gray-600">আপনার ব্যবসার বিস্তারিত তথ্য এবং পরিসংখ্যান</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট কাস্টমার</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {customerDistribution.reduce((sum, item) => sum + item.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">সব অঞ্চল মিলিয়ে</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সেরা অঞ্চল</CardTitle>
            <MapPin className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {topRegions[0]?.division || 'ঢাকা'}
            </div>
            <p className="text-xs text-muted-foreground">সর্বোচ্চ বিক্রয়</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট অঞ্চল</CardTitle>
            <MapPin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {divisionData.length}
            </div>
            <p className="text-xs text-muted-foreground">বিভাগ কভার করা</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">সেরা প্রোডাক্ট</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {topProducts[0]?.productName?.slice(0, 12) || 'প্রোডাক্ট'}...
            </div>
            <p className="text-xs text-muted-foreground">
              {topProducts[0]?.quantity || 0} পিস বিক্রি
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Distribution by Division - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>🗺️ বিভাগ অনুযায়ী কাস্টমার</CardTitle>
            <CardDescription>প্রতিটি বিভাগে কতজন কাস্টমার আছে</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={divisionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {divisionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Trend - Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>📈 বিক্রয়ের ট্রেন্ড</CardTitle>
            <CardDescription>গত ৭ দিনের বিক্রয়ের পরিমাণ</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? `৳${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'রেভিনিউ' : 'অর্ডার'
                ]} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="orders" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* District wise Customer Distribution - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>🏙️ জেলা অনুযায়ী কাস্টমার</CardTitle>
            <CardDescription>কোন জেলায় বেশি কাস্টমার</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerDistribution.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, 'কাস্টমার সংখ্যা']} />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Region - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>💰 অঞ্চল অনুযায়ী রেভিনিউ</CardTitle>
            <CardDescription>কোন অঞ্চল থেকে বেশি আয়</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerDistribution.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" />
                <YAxis />
                <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'রেভিনিউ']} />
                <Bar dataKey="revenue" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Products - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>🏆 সবচেয়ে বেশি বিক্রি হওয়া প্রোডাক্ট</CardTitle>
            <CardDescription>কোন প্রোডাক্ট কতটা বিক্রি হয়েছে</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="productName" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'quantity' ? `${value} পিস` : `৳${value.toLocaleString()}`,
                  name === 'quantity' ? 'বিক্রিত পরিমাণ' : 'রেভিনিউ'
                ]} />
                <Bar dataKey="quantity" fill="#FF8042" name="quantity" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Product Revenue Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>📊 প্রোডাক্ট রেভিনিউ বিতরণ</CardTitle>
            <CardDescription>কোন প্রোডাক্ট কত শতাংশ আয় এনেছে</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ productName, percent }) => `${productName.slice(0, 15)}... ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {topProducts.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`৳${value.toLocaleString()}`, 'রেভিনিউ']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>🛍️ প্রোডাক্ট পারফরমেন্স</CardTitle>
          <CardDescription>সব প্রোডাক্টের বিক্রয় পরিসংখ্যান</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-gray-500">{product.orders} অর্ডারে বিক্রি</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{product.quantity} পিস</p>
                  <p className="text-sm font-medium text-green-600">৳{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Regions Table */}
      <Card>
        <CardHeader>
          <CardTitle>🏆 সেরা পারফরমিং অঞ্চল</CardTitle>
          <CardDescription>যে অঞ্চলগুলো সবচেয়ে ভালো করছে</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRegions.map((region, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {region.rank}
                  </div>
                  <div>
                    <p className="font-medium">{region.division} - {region.district}</p>
                    <p className="text-sm text-gray-500">{region.count} কাস্টমার</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">৳{region.revenue.toLocaleString()}</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    +{region.growth}% গ্রোথ
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Low Performing Products Alert */}
      {topProducts.length > 3 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ কম বিক্রি হওয়া প্রোডাক্ট</CardTitle>
            <CardDescription className="text-yellow-700">
              এই প্রোডাক্টগুলোর উপর বেশি মনোযোগ দিন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topProducts.slice(-3).reverse().map((product, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-yellow-200">
                  <p className="font-medium text-gray-800">{product.productName}</p>
                  <p className="text-sm text-yellow-600">মাত্র {product.quantity} পিস বিক্রি</p>
                  <p className="text-xs text-gray-500">৳{product.revenue.toLocaleString()} রেভিনিউ</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}