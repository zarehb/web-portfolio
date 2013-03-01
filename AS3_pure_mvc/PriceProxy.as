package com.rocketbanner.designer.model.proxy
{
	import org.puremvc.as3.interfaces.IProxy;
	import org.puremvc.as3.patterns.proxy.Proxy;

	public class PriceProxy extends Proxy implements IProxy
	{
		public static const NAME:String = "PriceProxy";
		private var _currentPrice:Number;
		private var prices:XML;
		
		public function PriceProxy( data:Object = null )
		{
			super( NAME, data );
			prices = data as XML;
		}
		
		public function get currentPrice():Number
		{
			return _currentPrice;
		}

		public function set currentPrice(value:Number):void
		{
			_currentPrice = value;
		}

		public function get sizes():XMLList
		{
			return prices.sizes.size;
		}
		
		public function getPrice( sizeID:String, gradeName:String):String
		{
			return prices.grades.grade.(@name==gradeName).price.(@size==sizeID).@value.toString();
		}
		
	}
}