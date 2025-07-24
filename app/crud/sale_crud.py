from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import models.sale as sale_models
import models.product as product_models
import models.sale_detail as sale_detail_models
import models.inventory_movement as inventory_models
import schemas.sale_schema as schemas
from datetime import datetime
from typing import List
from fastapi import HTTPException, status

def get_sales(db: Session, skip: int = 0, limit: int = 100):
    return db.query(sale_models.Sale).offset(skip).limit(limit).all()

def get_sale(db: Session, sale_id: int):
    return db.query(sale_models.Sale).filter(sale_models.Sale.id == sale_id).first()

def create_sale_with_details(db: Session, sale: schemas.SaleCreate):
    try:
        # Validate products and stock first
        total_amount = 0
        sale_items = []
        
        for item in sale.items:
            # Get product and validate
            product = db.query(product_models.Product).filter(
                product_models.Product.id == item.product_id,
                product_models.Product.is_active == True
            ).first()
            
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product with id {item.product_id} not found or inactive"
                )
            
            # Check stock availability
            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product {product.name}. Available: {product.stock}, Requested: {item.quantity}"
                )
            
            subtotal = item.unit_price * item.quantity
            total_amount += subtotal
            sale_items.append({
                'product': product,
                'item': item,
                'subtotal': subtotal
            })
        
        # Calculate final total with tax and discount
        final_total = total_amount + sale.tax_amount - sale.discount_amount
        
        # Create sale record
        db_sale = sale_models.Sale(
            payment_method=sale.payment_method,
            customer_name=sale.customer_name,
            notes=sale.notes,
            tax_amount=sale.tax_amount,
            discount_amount=sale.discount_amount,
            total=final_total,
            fecha=datetime.now()
        )
        
        db.add(db_sale)
        db.flush()  # Get the sale ID without committing
        
        # Create sale details and update stock
        for sale_item in sale_items:
            product = sale_item['product']
            item = sale_item['item']
            subtotal = sale_item['subtotal']
            
            # Create sale detail
            db_detail = sale_detail_models.SaleDetail(
                sale_id=db_sale.id,
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=item.unit_price,
                subtotal=subtotal
            )
            db.add(db_detail)
            
            # Update product stock
            previous_stock = product.stock
            product.stock -= item.quantity
            
            # Create inventory movement record (if you have this model)
            movement = inventory_models.InventoryMovement(
                product_id=item.product_id,
                movement_type='sale',
                quantity=-item.quantity,
                reference_type='sale',
                reference_id=db_sale.id,
                movement_date=datetime.now(),
                notes=f"Sale #{db_sale.id}",
                previous_stock=previous_stock,
                new_stock=product.stock
            )
            db.add(movement)
        
        # Commit all changes
        db.commit()
        db.refresh(db_sale)
        
        return db_sale
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating sale: {str(e)}"
        )

def update_sale(db: Session, sale_id: int, sale: schemas.SaleBase):
    db_sale = db.query(sale_models.Sale).filter(sale_models.Sale.id == sale_id).first()
    if db_sale:
        for key, value in sale.dict(exclude_unset=True).items():
            setattr(db_sale, key, value)
        db.commit()
        db.refresh(db_sale)
        return db_sale
    return None

def delete_sale(db: Session, sale_id: int):
    db_sale = db.query(sale_models.Sale).filter(sale_models.Sale.id == sale_id).first()
    if db_sale:
        # Note: In a real system, you should reverse stock changes
        db.delete(db_sale)
        db.commit()
        return True
    return False

def get_daily_sales_count(db: Session, today):
    return db.query(func.count(sale_models.Sale.id)).filter(
        func.date(sale_models.Sale.fecha) == today
    ).scalar() or 0

def get_daily_revenue(db: Session, today):
    return db.query(func.sum(sale_models.Sale.total)).filter(
        func.date(sale_models.Sale.fecha) == today
    ).scalar() or 0.0

def get_best_selling_products(db: Session, since_date, limit=10):
    results = db.query(
        product_models.Product.id,
        product_models.Product.name,
        product_models.Product.code,
        func.sum(sale_detail_models.SaleDetail.quantity).label('total_sold'),
        func.sum(sale_detail_models.SaleDetail.subtotal).label('total_revenue')
    ).join(
        sale_detail_models.SaleDetail, product_models.Product.id == sale_detail_models.SaleDetail.product_id
    ).join(
        sale_models.Sale, sale_detail_models.SaleDetail.sale_id == sale_models.Sale.id
    ).filter(
        sale_models.Sale.fecha >= since_date,
        product_models.Product.is_active == True
    ).group_by(
        product_models.Product.id, product_models.Product.name, product_models.Product.code
    ).order_by(
        desc('total_sold')
    ).limit(limit).all()
    return results

def get_sales_report(db: Session, start_date, end_date):
    results = db.query(
        func.date(sale_models.Sale.fecha).label('date'),
        func.count(sale_models.Sale.id).label('total_sales'),
        func.sum(sale_models.Sale.total).label('total_revenue'),
        func.sum(sale_detail_models.SaleDetail.quantity).label('total_products_sold')
    ).join(
        sale_detail_models.SaleDetail, sale_models.Sale.id == sale_detail_models.SaleDetail.sale_id
    ).filter(
        func.date(sale_models.Sale.fecha) >= start_date,
        func.date(sale_models.Sale.fecha) <= end_date
    ).group_by(
        func.date(sale_models.Sale.fecha)
    ).order_by(
        desc('date')
    ).all()
    return results