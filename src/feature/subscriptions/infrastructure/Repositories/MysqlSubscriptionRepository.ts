// ===== src/feature/subscriptions/infrastructure/repositories/MysqlSubscriptionRepository.ts =====
import { executeQuery } from '../../../../core/config/Mysql';
import { SubscriptionRepository } from '../../domain/SubscriptionRepository';
import { Subscription, CreateSubscriptionData, UpdateSubscriptionData, SubscriptionStatus } from '../../domain/Subscription';
import { SubscriptionPlan, CreateSubscriptionPlanData, UpdateSubscriptionPlanData } from '../../domain/SubscriptionPlan';
import { v4 as uuidv4 } from 'uuid';

export class MysqlSubscriptionRepository implements SubscriptionRepository {

    // ===== SUBSCRIPTION PLANS =====

    async findAllPlans(): Promise<SubscriptionPlan[]> {
        console.log('📋 MysqlSubscriptionRepository - Finding all subscription plans');

        const sql = `
            SELECT id, uuid, name, description, price, duration_days, max_products, 
                   max_images_per_product, features, is_active, created_at, updated_at
            FROM subscription_plans 
            WHERE is_active = TRUE
            ORDER BY price ASC
        `;

        try {
            const rows = await executeQuery(sql, []);
            const plans = rows.map((row: any) => this.mapRowToSubscriptionPlan(row));
            console.log(`✅ Found ${plans.length} subscription plans`);
            return plans;
        } catch (error) {
            console.error('💥 Error finding subscription plans:', error);
            throw new Error('Failed to fetch subscription plans');
        }
    }

    async findPlanByUuid(uuid: string): Promise<SubscriptionPlan | null> {
        console.log('🔍 MysqlSubscriptionRepository - Finding plan by UUID:', uuid);

        const sql = `
            SELECT id, uuid, name, description, price, duration_days, max_products, 
                   max_images_per_product, features, is_active, created_at, updated_at
            FROM subscription_plans 
            WHERE uuid = ?
        `;

        try {
            const rows = await executeQuery(sql, [uuid]);
            if (rows.length > 0) {
                const plan = this.mapRowToSubscriptionPlan(rows[0]);
                console.log('✅ Subscription plan found by UUID');
                return plan;
            }
            console.log('❌ Subscription plan not found by UUID');
            return null;
        } catch (error) {
            console.error('💥 Error finding plan by UUID:', error);
            throw new Error('Failed to find subscription plan by UUID');
        }
    }

    async findPlanById(id: number): Promise<SubscriptionPlan | null> {
        console.log('🔍 MysqlSubscriptionRepository - Finding plan by ID:', id);

        const sql = `
            SELECT id, uuid, name, description, price, duration_days, max_products, 
                   max_images_per_product, features, is_active, created_at, updated_at
            FROM subscription_plans 
            WHERE id = ?
        `;

        try {
            const rows = await executeQuery(sql, [id]);
            if (rows.length > 0) {
                const plan = this.mapRowToSubscriptionPlan(rows[0]);
                console.log('✅ Subscription plan found by ID');
                return plan;
            }
            console.log('❌ Subscription plan not found by ID');
            return null;
        } catch (error) {
            console.error('💥 Error finding plan by ID:', error);
            throw new Error('Failed to find subscription plan by ID');
        }
    }

    async createPlan(planData: CreateSubscriptionPlanData): Promise<SubscriptionPlan> {
        console.log('💾 MysqlSubscriptionRepository - Creating subscription plan:', planData.name);

        const uuid = uuidv4();
        const { name, description, price, durationDays, maxProducts, maxImagesPerProduct, features, isActive = true } = planData;

        const sql = `
            INSERT INTO subscription_plans (uuid, name, description, price, duration_days, max_products, 
                                          max_images_per_product, features, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            uuid,
            name.trim(),
            description?.trim() || null,
            price,
            durationDays,
            maxProducts,
            maxImagesPerProduct,
            JSON.stringify(features),
            isActive
        ];

        try {
            const result = await executeQuery(sql, params);
            console.log('✅ Subscription plan inserted with ID:', result.insertId);

            const createdPlan = await this.findPlanByUuid(uuid);
            if (!createdPlan) {
                throw new Error('Failed to retrieve created subscription plan');
            }

            console.log('🎉 Subscription plan created successfully');
            return createdPlan;
        } catch (error: any) {
            console.error('💥 Error creating subscription plan:', error.message);
            throw new Error('Failed to create subscription plan');
        }
    }

    // Agregar este método:
    async findExpiredSubscriptions(): Promise<Subscription[]> {
        const sql = `
        SELECT id, uuid, user_id, subscription_plan_id, status, started_at, expires_at,
               payment_method, payment_reference, payment_amount, auto_renew, 
               cancelled_at, cancellation_reason, created_at, updated_at
        FROM user_subscriptions 
        WHERE status = 'active' AND expires_at <= NOW()
    `;

        const rows = await executeQuery(sql, []);
        return rows.map((row: any) => this.mapRowToSubscription(row));
    }

    async updatePlan(uuid: string, planData: UpdateSubscriptionPlanData): Promise<SubscriptionPlan | null> {
        console.log('🔄 MysqlSubscriptionRepository - Updating plan:', uuid);

        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (planData.name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(planData.name.trim());
        }
        if (planData.description !== undefined) {
            updateFields.push('description = ?');
            updateValues.push(planData.description?.trim() || null);
        }
        if (planData.price !== undefined) {
            updateFields.push('price = ?');
            updateValues.push(planData.price);
        }
        if (planData.durationDays !== undefined) {
            updateFields.push('duration_days = ?');
            updateValues.push(planData.durationDays);
        }
        if (planData.maxProducts !== undefined) {
            updateFields.push('max_products = ?');
            updateValues.push(planData.maxProducts);
        }
        if (planData.maxImagesPerProduct !== undefined) {
            updateFields.push('max_images_per_product = ?');
            updateValues.push(planData.maxImagesPerProduct);
        }
        if (planData.features !== undefined) {
            updateFields.push('features = ?');
            updateValues.push(JSON.stringify(planData.features));
        }
        if (planData.isActive !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(planData.isActive);
        }

        if (updateFields.length === 0) {
            console.log('❌ No fields to update');
            return null;
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(uuid);

        const sql = `UPDATE subscription_plans SET ${updateFields.join(', ')} WHERE uuid = ?`;

        try {
            const result = await executeQuery(sql, updateValues);

            if (result.affectedRows > 0) {
                console.log('✅ Subscription plan updated successfully');
                return await this.findPlanByUuid(uuid);
            }

            console.log('❌ Subscription plan not found for update');
            return null;
        } catch (error) {
            console.error('💥 Error updating subscription plan:', error);
            throw new Error('Failed to update subscription plan');
        }
    }

    async deactivatePlan(uuid: string): Promise<boolean> {
        console.log('🗑️ MysqlSubscriptionRepository - Deactivating plan:', uuid);

        const sql = 'UPDATE subscription_plans SET is_active = FALSE WHERE uuid = ?';

        try {
            const result = await executeQuery(sql, [uuid]);
            const deactivated = result.affectedRows > 0;

            console.log(`${deactivated ? '✅' : '❌'} Deactivate result:`, result.affectedRows, 'rows affected');
            return deactivated;
        } catch (error) {
            console.error('💥 Error deactivating subscription plan:', error);
            throw new Error('Failed to deactivate subscription plan');
        }
    }

    // ===== USER SUBSCRIPTIONS =====

    async findActiveSubscriptionByUserId(userId: number): Promise<Subscription | null> {
        console.log('🔍 MysqlSubscriptionRepository - Finding active subscription for user:', userId);

        const sql = `
            SELECT id, uuid, user_id, subscription_plan_id, status, started_at, expires_at,
                   payment_method, payment_reference, payment_amount, auto_renew, 
                   cancelled_at, cancellation_reason, created_at, updated_at
            FROM user_subscriptions 
            WHERE user_id = ? AND status = 'active' AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;

        try {
            const rows = await executeQuery(sql, [userId]);
            if (rows.length > 0) {
                const subscription = this.mapRowToSubscription(rows[0]);
                console.log('✅ Active subscription found');
                return subscription;
            }
            console.log('❌ No active subscription found');
            return null;
        } catch (error) {
            console.error('💥 Error finding active subscription:', error);
            throw new Error('Failed to find active subscription');
        }
    }

    async findSubscriptionsByUserId(userId: number): Promise<Subscription[]> {
        console.log('📋 MysqlSubscriptionRepository - Finding all subscriptions for user:', userId);

        const sql = `
            SELECT id, uuid, user_id, subscription_plan_id, status, started_at, expires_at,
                   payment_method, payment_reference, payment_amount, auto_renew, 
                   cancelled_at, cancellation_reason, created_at, updated_at
            FROM user_subscriptions 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `;

        try {
            const rows = await executeQuery(sql, [userId]);
            const subscriptions = rows.map((row: any) => this.mapRowToSubscription(row));
            console.log(`✅ Found ${subscriptions.length} subscriptions for user`);
            return subscriptions;
        } catch (error) {
            console.error('💥 Error finding user subscriptions:', error);
            throw new Error('Failed to find user subscriptions');
        }
    }

    async findSubscriptionByUuid(uuid: string): Promise<Subscription | null> {
        console.log('🔍 MysqlSubscriptionRepository - Finding subscription by UUID:', uuid);

        const sql = `
            SELECT id, uuid, user_id, subscription_plan_id, status, started_at, expires_at,
                   payment_method, payment_reference, payment_amount, auto_renew, 
                   cancelled_at, cancellation_reason, created_at, updated_at
            FROM user_subscriptions 
            WHERE uuid = ?
        `;

        try {
            const rows = await executeQuery(sql, [uuid]);
            if (rows.length > 0) {
                const subscription = this.mapRowToSubscription(rows[0]);
                console.log('✅ Subscription found by UUID');
                return subscription;
            }
            console.log('❌ Subscription not found by UUID');
            return null;
        } catch (error) {
            console.error('💥 Error finding subscription by UUID:', error);
            throw new Error('Failed to find subscription by UUID');
        }
    }

    async createSubscription(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
        console.log('💾 MysqlSubscriptionRepository - Creating subscription for user:', subscriptionData.userId);

        const uuid = uuidv4();
        const { userId, subscriptionPlanId, paymentMethod, paymentReference, paymentAmount, autoRenew = false } = subscriptionData;

        const sql = `
            INSERT INTO user_subscriptions (uuid, user_id, subscription_plan_id, status, 
                                          payment_method, payment_reference, payment_amount, auto_renew)
            VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
        `;

        const params = [
            uuid,
            userId,
            subscriptionPlanId,
            paymentMethod || null,
            paymentReference || null,
            paymentAmount || null,
            autoRenew
        ];

        try {
            const result = await executeQuery(sql, params);
            console.log('✅ Subscription inserted with ID:', result.insertId);

            const createdSubscription = await this.findSubscriptionByUuid(uuid);
            if (!createdSubscription) {
                throw new Error('Failed to retrieve created subscription');
            }

            console.log('🎉 Subscription created successfully');
            return createdSubscription;
        } catch (error: any) {
            console.error('💥 Error creating subscription:', error.message);
            throw new Error('Failed to create subscription');
        }
    }

    async updateSubscription(uuid: string, subscriptionData: UpdateSubscriptionData): Promise<Subscription | null> {
        console.log('🔄 MysqlSubscriptionRepository - Updating subscription:', uuid);

        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (subscriptionData.status !== undefined) {
            updateFields.push('status = ?');
            updateValues.push(subscriptionData.status);

            // Si se activa, establecer started_at
            if (subscriptionData.status === 'active') {
                updateFields.push('started_at = CURRENT_TIMESTAMP');
            }
        }
        if (subscriptionData.expiresAt !== undefined) {
            updateFields.push('expires_at = ?');
            updateValues.push(subscriptionData.expiresAt);
        }
        if (subscriptionData.autoRenew !== undefined) {
            updateFields.push('auto_renew = ?');
            updateValues.push(subscriptionData.autoRenew);
        }
        if (subscriptionData.cancellationReason !== undefined) {
            updateFields.push('cancellation_reason = ?');
            updateValues.push(subscriptionData.cancellationReason);
        }

        if (updateFields.length === 0) {
            console.log('❌ No fields to update');
            return null;
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        updateValues.push(uuid);

        const sql = `UPDATE user_subscriptions SET ${updateFields.join(', ')} WHERE uuid = ?`;

        try {
            const result = await executeQuery(sql, updateValues);

            if (result.affectedRows > 0) {
                console.log('✅ Subscription updated successfully');
                return await this.findSubscriptionByUuid(uuid);
            }

            console.log('❌ Subscription not found for update');
            return null;
        } catch (error) {
            console.error('💥 Error updating subscription:', error);
            throw new Error('Failed to update subscription');
        }
    }

    async cancelSubscription(uuid: string, reason: string): Promise<boolean> {
        console.log('❌ MysqlSubscriptionRepository - Cancelling subscription:', uuid);

        const sql = `
            UPDATE user_subscriptions 
            SET cancelled_at = CURRENT_TIMESTAMP, cancellation_reason = ?, updated_at = CURRENT_TIMESTAMP
            WHERE uuid = ?
        `;

        try {
            const result = await executeQuery(sql, [reason, uuid]);
            const cancelled = result.affectedRows > 0;

            console.log(`${cancelled ? '✅' : '❌'} Cancel result:`, result.affectedRows, 'rows affected');
            return cancelled;
        } catch (error) {
            console.error('💥 Error cancelling subscription:', error);
            throw new Error('Failed to cancel subscription');
        }
    }

    async hasActiveSubscription(userId: number): Promise<boolean> {
        console.log('🔍 MysqlSubscriptionRepository - Checking active subscription for user:', userId);

        const sql = `
            SELECT COUNT(*) as count 
            FROM user_subscriptions 
            WHERE user_id = ? AND status = 'active' AND expires_at > NOW()
        `;

        try {
            const rows = await executeQuery(sql, [userId]);
            const hasActive = rows[0].count > 0;
            console.log('📊 Has active subscription:', hasActive);
            return hasActive;
        } catch (error) {
            console.error('💥 Error checking active subscription:', error);
            throw new Error('Failed to check active subscription');
        }
    }

    async getSubscriptionWithPlan(uuid: string): Promise<{ subscription: Subscription; plan: SubscriptionPlan; } | null> {
        console.log('🔍 MysqlSubscriptionRepository - Getting subscription with plan:', uuid);

        const sql = `
            SELECT 
                us.id, us.uuid, us.user_id, us.subscription_plan_id, us.status, us.started_at, us.expires_at,
                us.payment_method, us.payment_reference, us.payment_amount, us.auto_renew, 
                us.cancelled_at, us.cancellation_reason, us.created_at, us.updated_at,
                sp.id as plan_id, sp.uuid as plan_uuid, sp.name as plan_name, sp.description as plan_description,
                sp.price as plan_price, sp.duration_days, sp.max_products, sp.max_images_per_product,
                sp.features as plan_features, sp.is_active as plan_is_active, 
                sp.created_at as plan_created_at, sp.updated_at as plan_updated_at
            FROM user_subscriptions us
            JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
            WHERE us.uuid = ?
        `;

        try {
            const rows = await executeQuery(sql, [uuid]);
            if (rows.length > 0) {
                const row = rows[0];
                const subscription = this.mapRowToSubscription(row);
                const plan = this.mapRowToSubscriptionPlan({
                    id: row.plan_id,
                    uuid: row.plan_uuid,
                    name: row.plan_name,
                    description: row.plan_description,
                    price: row.plan_price,
                    duration_days: row.duration_days,
                    max_products: row.max_products,
                    max_images_per_product: row.max_images_per_product,
                    features: row.plan_features,
                    is_active: row.plan_is_active,
                    created_at: row.plan_created_at,
                    updated_at: row.plan_updated_at
                });

                console.log('✅ Subscription with plan found');
                return { subscription, plan };
            }
            console.log('❌ Subscription with plan not found');
            return null;
        } catch (error) {
            console.error('💥 Error getting subscription with plan:', error);
            throw new Error('Failed to get subscription with plan');
        }
    }

    async findExpiringSoon(days: number): Promise<Subscription[]> {
        console.log('⚠️ MysqlSubscriptionRepository - Finding subscriptions expiring in', days, 'days');

        const sql = `
            SELECT id, uuid, user_id, subscription_plan_id, status, started_at, expires_at,
                   payment_method, payment_reference, payment_amount, auto_renew, 
                   cancelled_at, cancellation_reason, created_at, updated_at
            FROM user_subscriptions 
            WHERE status = 'active' 
              AND expires_at > NOW() 
              AND expires_at <= DATE_ADD(NOW(), INTERVAL ? DAY)
            ORDER BY expires_at ASC
        `;

        try {
            const rows = await executeQuery(sql, [days]);
            const subscriptions = rows.map((row: any) => this.mapRowToSubscription(row));
            console.log(`✅ Found ${subscriptions.length} subscriptions expiring soon`);
            return subscriptions;
        } catch (error) {
            console.error('💥 Error finding expiring subscriptions:', error);
            throw new Error('Failed to find expiring subscriptions');
        }
    }

    async getSubscriptionStats(): Promise<{ totalSubscriptions: number; activeSubscriptions: number; expiredSubscriptions: number; cancelledSubscriptions: number; totalRevenue: number; monthlyRevenue: number; }> {
        console.log('📊 MysqlSubscriptionRepository - Getting subscription stats');

        const sql = `
            SELECT 
                COUNT(*) as totalSubscriptions,
                SUM(CASE WHEN status = 'active' AND expires_at > NOW() THEN 1 ELSE 0 END) as activeSubscriptions,
                SUM(CASE WHEN status = 'expired' OR (status = 'active' AND expires_at <= NOW()) THEN 1 ELSE 0 END) as expiredSubscriptions,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledSubscriptions,
                COALESCE(SUM(payment_amount), 0) as totalRevenue,
                COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN payment_amount ELSE 0 END), 0) as monthlyRevenue
            FROM user_subscriptions
        `;

        try {
            const rows = await executeQuery(sql, []);
            const stats = {
                totalSubscriptions: rows[0].totalSubscriptions || 0,
                activeSubscriptions: rows[0].activeSubscriptions || 0,
                expiredSubscriptions: rows[0].expiredSubscriptions || 0,
                cancelledSubscriptions: rows[0].cancelledSubscriptions || 0,
                totalRevenue: parseFloat(rows[0].totalRevenue) || 0,
                monthlyRevenue: parseFloat(rows[0].monthlyRevenue) || 0
            };

            console.log('✅ Subscription stats retrieved:', stats);
            return stats;
        } catch (error) {
            console.error('💥 Error getting subscription stats:', error);
            throw new Error('Failed to get subscription stats');
        }
    }

    // Helper methods
    private mapRowToSubscriptionPlan(row: any): SubscriptionPlan {
        let featuresParsed: string[] = [];

        if (row.features) {
            try {
                // Si es un JSON correcto
                featuresParsed = JSON.parse(row.features);
            } catch {
                // Si viene texto plano lo envolvemos en un array
                featuresParsed = [row.features];
            }
        }

        return new SubscriptionPlan(
            row.id,
            row.uuid,
            row.name,
            row.description,
            parseFloat(row.price),
            row.duration_days,
            row.max_products,
            row.max_images_per_product,
            featuresParsed,
            row.is_active,
            row.created_at,
            row.updated_at
        );
    }


    private mapRowToSubscription(row: any): Subscription {
        return new Subscription(
            row.id,
            row.uuid,
            row.user_id,
            row.subscription_plan_id,
            row.status as SubscriptionStatus,
            row.started_at,
            row.expires_at,
            row.payment_method,
            row.payment_reference,
            row.payment_amount ? parseFloat(row.payment_amount) : null,
            row.auto_renew,
            row.cancelled_at,
            row.cancellation_reason,
            row.created_at,
            row.updated_at
        );
    }
}