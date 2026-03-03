import { Card } from 'antd'

function FeatureCard({ icon, title, description }) {
  return (
    <Card
      className="feature-card h-full text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0"
      styles={{ body: { padding: '24px 16px' } }}
    >
      <div className="flex flex-col items-center">
        <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mb-4">
          <span className="text-2xl text-primary-600">{icon}</span>
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
    </Card>
  )
}

export default FeatureCard
